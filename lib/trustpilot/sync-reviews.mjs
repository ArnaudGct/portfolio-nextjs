import { fetchTrustpilotReviews } from "./firecrawl.mjs";

export async function syncTrustpilotReviews(prisma, options = {}) {
  const { reviews, totalReviewCount, metadata } =
    await fetchTrustpilotReviews(options);
  const syncedAt = new Date();

  const operations = reviews.map((review) =>
    prisma.trustpilot_reviews.upsert({
      where: { id: review.id },
      create: {
        id: review.id,
        client: review.client,
        contenu: review.contenu,
        rating: review.rating,
        date_publication: review.datePublication,
        review_url: review.reviewUrl,
        afficher: true,
        last_seen_at: syncedAt,
      },
      update: {
        client: review.client,
        contenu: review.contenu,
        rating: review.rating,
        date_publication: review.datePublication,
        review_url: review.reviewUrl,
        afficher: true,
        last_seen_at: syncedAt,
      },
    }),
  );

  // Si toute la page tient dans le scrape, les avis absents ont été retirés de
  // Trustpilot. Au-delà d'une page, on ne masque rien pour préserver l'historique.
  if (totalReviewCount !== null && totalReviewCount <= reviews.length) {
    operations.push(
      prisma.trustpilot_reviews.updateMany({
        where: { id: { notIn: reviews.map((review) => review.id) } },
        data: { afficher: false },
      }),
    );
  }

  await prisma.$transaction(operations);

  return {
    syncedAt,
    syncedReviews: reviews.length,
    totalReviewCount,
    scrapeId: metadata?.scrapeId || null,
    cacheState: metadata?.cacheState || null,
  };
}
