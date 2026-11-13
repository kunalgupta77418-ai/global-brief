// Vercel serverless function: Analyse endpoint
// Accepts POST with {input: string} where input is a URL or plain headline.
// For URLs: fetches the page (max 8 KB), strips HTML, and sends a Gemini request.
// For plain headlines: calls Gemini directly.
// Returns a JSON matching the UI expectations (summary, claims, timeline, lenses, scenarios, explanation levels).

import type { VercelRequest, VercelResponse } from "@vercel/node";

interface AnalyseResult {
  summary: { simple: string; student: string; expert: string };
  claims: { text: string; evidence: string; sources: string[] }[];
  timeline: { date: string; title: string; description: string; source_url: string; source_name: string }[];
  lenses: { label: string; text: string; affected: string }[];
  scenarios: { title: string; text: string; watch: string }[];
  error?: string;
}

// Simple helper to validate URLs and reject private/local IPs
function isValidPublicUrl(str: string): boolean {
  try {
    const url = new URL(str);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const hostname = url.hostname;
    // reject localhost and common private ranges
    const privatePatterns = [/^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^(::1|fe80:)/];
    return !privatePatterns.some((p) => p.test(hostname));
  } catch {
    return false;
  }
}

// Very light HTML‑to‑text conversion
function stripHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Call Gemini (free tier) with a strict JSON schema request
async function callGemini(prompt: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: "Missing GEMINI_API_KEY" };
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
  };
  try {
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) return { error: `Gemini API error ${res.status}` };
    const json = await res.json();
    // Assume the model returns a JSON string in the first part
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text) : { error: "Malformed Gemini response" };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // ---- Authentication ----
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    res.status(500).json({ error: 'Supabase env missing' });
    return;
  }
  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: supabaseKey },
    });
    if (!userRes.ok) {
      res.status(401).json({ error: 'Invalid Supabase token' });
      return;
    }
  } catch (e) {
    res.status(502).json({ error: `Supabase verification error: ${(e as Error).message}` });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { input } = req.body ?? {};
  if (!input || typeof input !== "string") {
    res.status(400).json({ error: "Missing or invalid 'input'" });
    return;
  }

  let content = "";
  let sourceUrl = "";
  if (isValidPublicUrl(input)) {
    // Fetch the URL (8 KB limit)
    try {
      const response = await fetch(input, { timeout: 8000 });
      if (!response.ok) throw new Error(`Fetch error ${response.status}`);
      const text = await response.text();
      content = stripHtml(text).slice(0, 8000); // truncate
      sourceUrl = input;
    } catch (e) {
      res.status(502).json({ error: `Unable to fetch URL: ${(e as Error).message}` });
      return;
    }
  } else {
    // Treat as headline
    content = input;
  }

  // Build a concise prompt for Gemini following the required schema
  const geminiPrompt = `You are a neutral news analyst. Produce a JSON object with the shape:
${JSON.stringify({
    summary: { simple: "", student: "", expert: "" },
    claims: [{ text: "", evidence: "Confirmed by multiple sources" as const, sources: [""] }],
    timeline: [{ date: "", title: "", description: "", source_url: "", source_name: "" }],
    lenses: [{ label: "Political", text: "", affected: "" }],
    scenarios: [{ title: "", text: "", watch: "" }]
  }, null, 2)}
Use the following source material (or headline) to fill the fields. If any field cannot be grounded, omit it or leave empty strings. Return ONLY the JSON.
Source: ${content}`;

  const geminiResult = await callGemini(geminiPrompt);
  if (geminiResult.error) {
    res.status(502).json({ error: geminiResult.error });
    return;
  }

  const response: AnalyseResult = { ...geminiResult } as AnalyseResult;
  // Add source_url for timeline items if we fetched a page
  if (sourceUrl) {
    response.timeline = response.timeline?.map((t) => ({ ...t, source_url: sourceUrl })) ?? [];
  }

  res.status(200).json(response);
};
