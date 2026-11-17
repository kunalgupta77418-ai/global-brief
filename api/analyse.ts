// Vercel serverless function: /api/analyse
// Accepts POST with { input: string } where input is a URL or plain headline.
// Requires Supabase user JWT in Authorization: Bearer <token>.

interface VercelRequest {
  method?: string;
  body?: any;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

interface AnalyseResult {
  title?: string;
  source?: string;
  published?: string;
  summary: { simple: string; student: string; expert: string };
  claims: { text: string; evidence: "Confirmed by multiple sources" | "Single source" | "Disputed" | "Unverified"; sources: string[] }[];
  timeline: { date: string; title: string; text: string; source: string; source_url?: string }[];
  lenses: { label: string; text: string; affected: string }[];
  scenarios: { title: string; text: string; watch: string }[];
  groundingLabel?: string;
  error?: string;
}

// Check for valid public URL and reject localhost / private IPs
function isValidPublicUrl(str: string): boolean {
  try {
    const url = new URL(str);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const hostname = url.hostname.toLowerCase();
    if (hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")) return false;
    const privatePatterns = [
      /^127\./,
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^169\.254\./,
      /^0\./,
      /^(::1|fe80:)/i,
    ];
    return !privatePatterns.some((p) => p.test(hostname));
  } catch {
    return false;
  }
}

// Light HTML-to-text stripper
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchWithTimeout(url: string, timeoutMs: number = 6000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "GlobalBrief/1.0 (Editorial Fact-Checking Bot; neutral; open-web)",
        "Accept": "text/html,application/xhtml+xml,text/plain",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function callGeminiSingle(model: string, apiKey: string, prompt: string): Promise<{ data?: any; status: number; error?: string }> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    return { status: 429, error: "Rate limit" };
  }
  if (!res.ok) {
    return { status: res.status, error: `API error ${res.status}` };
  }

  const json = await res.json();
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return { status: 502, error: "No response candidate" };

  try {
    return { status: 200, data: JSON.parse(rawText) };
  } catch {
    return { status: 502, error: "Failed to parse model JSON" };
  }
}

async function callGemini(prompt: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: "Missing GEMINI_API_KEY environment variable" };

  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
  for (const model of models) {
    let result = await callGeminiSingle(model, apiKey, prompt);

    // If 429 rate limit, retry once after 1.5s backoff
    if (result.status === 429) {
      await new Promise((r) => setTimeout(r, 1500));
      result = await callGeminiSingle(model, apiKey, prompt);
      if (result.status === 429) {
        return { error: "High demand right now, please try again shortly." };
      }
    }

    if (result.status === 200 && result.data) {
      return result.data;
    }
  }

  return { error: "Unable to generate brief right now. Please try again in a few moments." };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // ---- Validate Supabase access token ----
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required. Please sign in to analyze links." });
    return;
  }

  const token = authHeader.split(" ")[1];
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { Authorization: `Bearer ${token}`, apikey: supabaseKey },
      });
      if (!userRes.ok) {
        res.status(401).json({ error: "Session expired. Please sign in again." });
        return;
      }
    } catch {
      // Continue gracefully if network glitch verifying token
    }
  }

  const { input } = req.body ?? {};
  if (!input || typeof input !== "string" || !input.trim()) {
    res.status(400).json({ error: "Please enter a valid link or news headline." });
    return;
  }

  const trimmedInput = input.trim();
  let articleText = "";
  let sourceUrl = "";
  let isUrl = false;

  if (trimmedInput.startsWith("http://") || trimmedInput.startsWith("https://")) {
    if (!isValidPublicUrl(trimmedInput)) {
      res.status(400).json({ error: "Only public http(s) links are allowed. Local and private addresses cannot be checked." });
      return;
    }
    isUrl = true;
    sourceUrl = trimmedInput;

    try {
      const rawHtml = await fetchWithTimeout(trimmedInput, 6000);
      articleText = stripHtml(rawHtml).slice(0, 8000);
      if (articleText.length < 50) {
        articleText = ""; // Might be paywalled or client-side rendered SPA
      }
    } catch {
      articleText = "";
    }
  } else {
    articleText = trimmedInput.slice(0, 1000);
  }

  const promptText = articleText || trimmedInput;
  const prompt = `You are an expert, rigorously neutral news analyst for Global Brief. Analyze the following news story or headline.
DO NOT take sides. Prefer stating "not enough verified information" over guessing or hallucinating facts.

Return ONLY a JSON object strictly following this JSON schema:
{
  "title": "Clear neutral headline summarizing the subject",
  "source": "Source outlet or 'Web Research'",
  "published": "Date or 'Recently reported'",
  "summary": {
    "simple": "A simple 2-3 sentence overview understandable by anyone.",
    "student": "A well-balanced 3-4 sentence neutral summary suitable for a curious student.",
    "expert": "An in-depth, rigorous breakdown including institutional and policy context."
  },
  "claims": [
    {
      "text": "Factual statement from the reporting",
      "evidence": "Confirmed by multiple sources | Single source | Disputed | Unverified",
      "sources": ["Outlet name or publication"]
    }
  ],
  "timeline": [
    {
      "date": "Year or Month Year",
      "title": "Milestone title",
      "text": "What occurred and context",
      "source": "Verified reporting source"
    }
  ],
  "lenses": [
    { "label": "Political", "text": "Key governance, legal, or policy dynamics", "affected": "Who is affected" },
    { "label": "Economic", "text": "Financial, trade, employment, or market implications", "affected": "Who is affected" },
    { "label": "Social", "text": "Everyday community, cultural, or public impact", "affected": "Who is affected" },
    { "label": "Environmental", "text": "Resource, climate, or infrastructure context", "affected": "Who is affected" },
    { "label": "Global / India-specific", "text": "Broader international or domestic alignment", "affected": "Who is affected" }
  ],
  "scenarios": [
    {
      "title": "Potential trajectory 1",
      "text": "What could unfold next based on current evidence (Speculation, not prediction)",
      "watch": "Key upcoming decisions or metrics to watch"
    },
    {
      "title": "Potential trajectory 2",
      "text": "Alternative path or risk factor (Speculation, not prediction)",
      "watch": "Signposts or stakeholder responses to monitor"
    }
  ]
}

Input text:
${promptText}
`;

  const parsed = await callGemini(prompt);
  if (parsed.error) {
    res.status(502).json({ error: parsed.error });
    return;
  }

  const result: AnalyseResult = {
    title: parsed.title || trimmedInput,
    source: isUrl ? new URL(sourceUrl).hostname : (parsed.source || "News Desk"),
    published: parsed.published || "Today",
    summary: parsed.summary || {
      simple: "Information on this topic is emerging.",
      student: "Analysis is based on currently available public reporting.",
      expert: "Verified reporting is currently constrained by early-stage disclosures.",
    },
    claims: Array.isArray(parsed.claims) ? parsed.claims : [],
    timeline: Array.isArray(parsed.timeline)
      ? parsed.timeline.map((item: any) => ({
          date: item.date || "Recent",
          title: item.title || "Development reported",
          text: item.text || item.description || "",
          source: item.source || item.source_name || (isUrl ? new URL(sourceUrl).hostname : "Public record"),
          source_url: sourceUrl || undefined,
        }))
      : [],
    lenses: Array.isArray(parsed.lenses) ? parsed.lenses : [],
    scenarios: Array.isArray(parsed.scenarios) ? parsed.scenarios : [],
    groundingLabel: isUrl ? "Verified against published source" : "Based on reported headline",
  };

  res.status(200).json(result);
}
