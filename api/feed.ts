// Vercel serverless function: Headline feed
// Returns a JSON array of latest news items from a set of RSS feeds.
// If all external fetches fail, falls back to seeded demo stories.

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Simple RSS item interface
interface FeedItem {
  title: string;
  source: string;
  date: string; // ISO string
  link: string;
  snippet: string; // plain‑text excerpt
}

// List of reputable outlets (RSS URLs). These are public and free.
const sources: { url: string; name: string }[] = [
  { url: "https://feeds.npr.org/1001.xml", name: "NPR" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World" },
  { url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", name: "Times of India" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "Al Jazeera" },
  { url: "https://rss.cnn.com/rss/edition.rss", name: "CNN" },
];

// Small helper to strip HTML tags from a string
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Parse a single RSS XML string into FeedItem[] (lightweight, no extra deps)
function parseRss(xml: string, sourceName: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[0];
    const getTag = (tag: string): string => {
      const r = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, "i");
      const m = r.exec(itemXml);
      return m ? m[1].trim() : "";
    };
    const title = stripHtml(getTag("title"));
    const link = getTag("link");
    const pubDate = new Date(getTag("pubDate")).toISOString();
    const description = stripHtml(getTag("description"));
    const snippet = description.length > 200 ? description.slice(0, 197) + "..." : description;
    if (title && link) {
      items.push({ title, source: sourceName, date: pubDate, link, snippet });
    }
  }
  return items;
}

// Load demo stories (seeded) as a fallback. This imports the client data file.
let demoItems: FeedItem[] = [];
try {
  // The path is relative to the project root when Vercel builds.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { stories } = require("../client/src/data/news");
  demoItems = stories.map((s: any) => ({
    title: s.title,
    source: "Demo",
    date: new Date(s.date).toISOString(),
    link: s.link ?? "#",
    snippet: s.summary?.slice(0, 200) ?? "",
  }));
} catch (e) {
  // If the import fails, just leave demoItems empty.
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // Allow only GET
  if (req.method !== "GET") {
    res.status(405).send({ error: "Method not allowed" });
    return;
  }

  const allItems: FeedItem[] = [];
  const fetchPromises = sources.map(async (src) => {
    try {
      const response = await fetch(src.url, { timeout: 8000 });
      if (!response.ok) return;
      const text = await response.text();
      const parsed = parseRss(text, src.name);
      allItems.push(...parsed);
    } catch (e) {
      // Swallow fetch errors – we will fallback later.
    }
  });

  await Promise.allSettled(fetchPromises);

  // Deduplicate by link (case‑insensitive)
  const seen = new Set<string>();
  const unique: FeedItem[] = [];
  for (const it of allItems) {
    const key = it.link.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(it);
    }
  }

  // Sort newest first (by date)
  unique.sort((a, b) => (a.date < b.date ? 1 : -1));

  let finalItems: FeedItem[] = [];
  if (unique.length === 0) {
    // All external feeds failed – use demo data with a visible label.
    finalItems = demoItems.map((it) => ({ ...it, title: `[Demo] ${it.title}` }));
    res.setHeader("Cache-Control", "s-maxage=0, stale-while-revalidate=60");
  } else {
    finalItems = unique.slice(0, 20); // limit to reasonable size
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=60");
  }

  res.status(200).json(finalItems);
};
