export function validateTrustpilotPayload(payload) {
  if (!Array.isArray(payload?.reviews) || !payload.reviews.length || payload.reviews.length > 100) {
    throw new Error("La synchronisation doit contenir entre 1 et 100 avis");
  }
  const seen = new Set();
  const reviews = payload.reviews.map((review) => {
    const datePublication = new Date(review.datePublication);
    if (
      !/^[a-f0-9]{24}$/.test(review.id) || seen.has(review.id) ||
      typeof review.client !== "string" || !review.client.trim() || review.client.length > 100 ||
      typeof review.contenu !== "string" || !review.contenu.trim() || Buffer.byteLength(review.contenu, "utf8") > 60000 ||
      !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5 ||
      typeof review.datePublication !== "string" || !Number.isFinite(datePublication.getTime())
    ) throw new Error("Un avis Trustpilot est invalide ou dupliqué");
    seen.add(review.id);
    return {
      id: review.id, client: review.client.trim(), contenu: review.contenu.trim(),
      rating: review.rating, datePublication,
      reviewUrl: `https://fr.trustpilot.com/reviews/${review.id}`,
    };
  });
  const totalReviewCount = payload.totalReviewCount ?? null;
  if (totalReviewCount !== null && (!Number.isInteger(totalReviewCount) || totalReviewCount < reviews.length)) {
    throw new Error("Le nombre total d'avis Trustpilot est invalide");
  }
  return { reviews, totalReviewCount };
}

export async function storeTrustpilotReviews(prisma, { reviews, totalReviewCount }) {
  // Bootstrap ciblé : la base CapRover est accessible uniquement depuis le site.
  // Ne pas rejouer ici les migrations historiques du reste du portfolio.
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS trustpilot_reviews (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    client VARCHAR(100) NOT NULL,
    contenu TEXT NOT NULL,
    rating INTEGER NOT NULL,
    date_publication DATETIME(3) NOT NULL,
    review_url VARCHAR(500) NOT NULL,
    afficher BOOLEAN NOT NULL DEFAULT true,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL,
    last_seen_at DATETIME(3) NOT NULL,
    INDEX trustpilot_reviews_date_publication_idx (date_publication)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
  const syncedAt = new Date();
  const operations = reviews.map((review) => {
    const data = {
      client: review.client, contenu: review.contenu, rating: review.rating,
      date_publication: review.datePublication, review_url: review.reviewUrl,
      afficher: true, last_seen_at: syncedAt,
    };
    return prisma.trustpilot_reviews.upsert({
      where: { id: review.id }, create: { id: review.id, ...data }, update: data,
    });
  });
  if (totalReviewCount === reviews.length) {
    operations.push(prisma.trustpilot_reviews.updateMany({
      where: { id: { notIn: reviews.map((review) => review.id) } },
      data: { afficher: false },
    }));
  }
  await prisma.$transaction(operations);
  return { syncedAt, syncedReviews: reviews.length, totalReviewCount };
}
