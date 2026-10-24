import { fetchTrustpilotReviews } from "./browser.mjs";
import { storeTrustpilotReviews } from "./store-reviews.mjs";

export async function syncTrustpilotReviews(prisma) {
  return storeTrustpilotReviews(prisma, await fetchTrustpilotReviews());
}
