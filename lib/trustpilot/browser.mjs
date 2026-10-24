import { chromium } from "playwright";
import { parseTrustpilotPage } from "./parse-reviews.mjs";

export const TRUSTPILOT_URL = "https://fr.trustpilot.com/review/arnaudgct.fr?languages=all&sort=recency";

export async function fetchTrustpilotReviews() {
  const browser = await chromium.launch({ headless: true, channel: "chromium" });
  try {
    const page = await browser.newPage({ locale: "fr-FR" });
    const reviews = new Map();
    let totalReviewCount;
    let totalPages = 1;
    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      const url = new URL(TRUSTPILOT_URL);
      if (currentPage > 1) url.searchParams.set("page", String(currentPage));
      await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: 60000 });
      try {
        await page.waitForSelector("script#__NEXT_DATA__", { state: "attached", timeout: 45000 });
      } catch {
        throw new Error(`Trustpilot bloque la lecture de la page ${currentPage} : données absentes après 45 s. Aucun avis ne sera remplacé.`);
      }
      const result = parseTrustpilotPage(await page.content());
      if (result.currentPage !== currentPage) throw new Error("Trustpilot a renvoyé une autre page");
      if (currentPage === 1) {
        totalReviewCount = result.totalReviewCount;
        totalPages = result.totalPages;
        // Limite du contrat d'import : refuser toute synchronisation tronquée.
        if (totalPages > 5 || totalReviewCount > 100) throw new Error("Plus de 100 avis : augmenter la limite de synchronisation avant de continuer");
      } else if (result.totalReviewCount !== totalReviewCount || result.totalPages !== totalPages) {
        throw new Error("La liste Trustpilot a changé pendant la lecture ; réessayer plus tard");
      }
      for (const review of result.reviews) {
        if (reviews.has(review.id)) throw new Error("Trustpilot a répété un avis entre deux pages");
        reviews.set(review.id, review);
      }
      if (currentPage < totalPages) await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    if (reviews.size !== totalReviewCount) throw new Error(`Collecte Trustpilot incomplète : ${reviews.size}/${totalReviewCount} avis`);
    console.log(`Trustpilot : ${reviews.size} avis récupérés en direct avec Chromium.`);
    return { reviews: [...reviews.values()], totalReviewCount };
  } finally {
    await browser.close();
  }
}
