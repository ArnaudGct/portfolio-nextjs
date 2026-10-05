import { Firecrawl } from "firecrawl";
import { parseTrustpilotReviews } from "./parse-reviews.mjs";

export const TRUSTPILOT_URL =
  "https://fr.trustpilot.com/review/arnaudgct.fr?languages=all";

export async function fetchTrustpilotReviews({
  apiKey = process.env.FIRECRAWL_API_KEY,
  apiUrl = process.env.FIRECRAWL_API_URL,
} = {}) {
  if (!apiKey) {
    throw new Error("La variable FIRECRAWL_API_KEY est absente");
  }

  const firecrawl = new Firecrawl({
    apiKey,
    ...(apiUrl ? { apiUrl } : {}),
  });
  const document = await firecrawl.scrape(TRUSTPILOT_URL, {
    formats: ["rawHtml"],
    maxAge: 0,
    proxy: "auto",
    timeout: 60_000,
  });

  const parsed = parseTrustpilotReviews(document.rawHtml);

  return {
    ...parsed,
    metadata: document.metadata || null,
  };
}
