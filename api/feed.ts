// Vercel serverless function: Headline feed
// Returns a JSON array of latest news items from a set of RSS feeds.
// If external fetches fail, gracefully falls back to seeded demo stories.

interface VercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

interface FeedItem {
  title: string;
  source: string;
  date: string;
  link: string;
  snippet: string;
}

const sources: { url: string; name: string }[] = [
  { url: "https://feeds.npr.org/1001.xml", name: "NPR" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World" },
  { url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", name: "Times of India" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "Al Jazeera" },
  { url: "https://rss.cnn.com/rss/edition.rss", name: "CNN" },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parseRss(xml: string, sourceName: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[0];
    const getTag = (tag: string): string => {
      const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
      const m = r.exec(itemXml);
      return m ? m[1].trim() : "";
    };
    const title = stripHtml(getTag("title"));
    const link = getTag("link");
    const rawDate = getTag("pubDate");
    const pubDate = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();
    const description = stripHtml(getTag("description"));
    const snippet = description.length > 200 ? description.slice(0, 197) + "..." : description;
    if (title && link) {
      items.push({ title, source: sourceName, date: pubDate, link, snippet });
    }
  }
  return items;
}

const fallbackStories: FeedItem[] = [
  {
    title: "The water question is no longer a summer story",
    source: "The Public Ledger",
    date: new Date().toISOString(),
    link: "/story/water-and-the-city",
    snippet: "Across fast-growing cities, the argument is shifting from emergency tankers to who gets to plan the next decade of water.",
  },
  {
    title: "Schools are writing the first draft of a screen-time policy",
    source: "The Modern Campus",
    date: new Date().toISOString(),
    link: "/story/schools-and-screen-time",
    snippet: "From phones in lockers to advisory councils, educators look for practical boundaries that survive first-period reality.",
  },
  {
    title: "The state coastal resilience fund reaches its first test",
    source: "Coast & Common",
    date: new Date().toISOString(),
    link: "/story/coastal-resilience-fund",
    snippet: "With seawall plans contested and salt-tolerant crops expanding, coastal wards debate where public capital makes a difference.",
  },
  {
    title: "The cost of the next rupee: benchmark rates hold steady",
    source: "Financial Record",
    date: new Date().toISOString(),
    link: "/story/the-cost-of-the-next-rupee",
    snippet: "Borrowers watch EMIs while analysts track liquidity numbers that tell a quieter story about business confidence.",
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=1800");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).send({ error: "Method not allowed" });
    return;
  }

  const allItems: FeedItem[] = [];
  const fetchPromises = sources.map(async (src) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(src.url, {
        signal: controller.signal,
        headers: { "User-Agent": "GlobalBrief/1.0 (RSS News Reader)" },
      });
      if (!response.ok) return;
      const text = await response.text();
      const parsed = parseRss(text, src.name);
      allItems.push(...parsed);
    } catch {
      // Ignore individual feed errors
    } finally {
      clearTimeout(timer);
    }
  });

  await Promise.allSettled(fetchPromises);

  const seen = new Set<string>();
  const unique: FeedItem[] = [];
  for (const item of allItems) {
    const key = item.title.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (unique.length > 0) {
    res.status(200).json(unique.slice(0, 20));
  } else {
    res.status(200).json(fallbackStories);
  }
}
