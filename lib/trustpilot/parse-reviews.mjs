import { parse } from "node-html-parser";

const TRUSTPILOT_ORIGIN = "https://fr.trustpilot.com";

function collectNodes(value, predicate, nodes = []) {
  if (!value || typeof value !== "object") return nodes;

  if (Array.isArray(value)) {
    value.forEach((item) => collectNodes(item, predicate, nodes));
    return nodes;
  }

  if (predicate(value)) nodes.push(value);
  Object.values(value).forEach((item) => collectNodes(item, predicate, nodes));

  return nodes;
}

function hasSchemaType(node, expectedType) {
  const type = node?.["@type"];
  return type === expectedType || (Array.isArray(type) && type.includes(expectedType));
}

function getReviewId(review) {
  const candidates = [
    review.url,
    review["@id"],
    review.mainEntityOfPage?.["@id"],
  ];

  for (const candidate of candidates) {
    const id = candidate?.match(/(?:\/reviews\/|\/Review\/[^/]+\/)([^/?#]+)/i)?.[1];
    if (id) return id;
  }

  return null;
}

function normalizeReview(review) {
  const id = getReviewId(review);
  const client =
    typeof review.author === "string" ? review.author : review.author?.name;
  const contenu =
    review.reviewBody || review.description || review.headline || "";
  const rating = Number(review.reviewRating?.ratingValue);
  const datePublication = new Date(review.datePublished);

  if (
    !id ||
    !client?.trim() ||
    !contenu.trim() ||
    !Number.isFinite(rating) ||
    rating < 1 ||
    rating > 5 ||
    Number.isNaN(datePublication.getTime())
  ) {
    return null;
  }

  return {
    id,
    client: client.trim(),
    contenu: contenu.trim(),
    rating,
    datePublication,
    reviewUrl: `${TRUSTPILOT_ORIGIN}/reviews/${id}`,
  };
}

export function parseTrustpilotReviews(rawHtml) {
  if (!rawHtml?.trim()) {
    throw new Error("Firecrawl n'a renvoyé aucun HTML pour Trustpilot");
  }

  const root = parse(rawHtml);
  const jsonDocuments = [];

  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      jsonDocuments.push(JSON.parse(script.textContent));
    } catch {
      // Un bloc JSON-LD invalide ne doit pas empêcher l'analyse des suivants.
    }
  }

  const reviewNodes = jsonDocuments.flatMap((document) =>
    collectNodes(document, (node) => hasSchemaType(node, "Review")),
  );
  const aggregateRatings = jsonDocuments.flatMap((document) =>
    collectNodes(document, (node) => hasSchemaType(node, "AggregateRating")),
  );
  const reviews = [];
  const seen = new Set();

  for (const reviewNode of reviewNodes) {
    const review = normalizeReview(reviewNode);
    if (!review || seen.has(review.id)) continue;
    seen.add(review.id);
    reviews.push(review);
  }

  if (reviews.length === 0) {
    throw new Error("Aucun avis Trustpilot valide n'a été trouvé dans le JSON-LD");
  }

  const totalReviewCount = aggregateRatings
    .map((rating) => Number(rating.reviewCount || rating.ratingCount))
    .find((count) => Number.isInteger(count) && count >= reviews.length);

  return {
    reviews,
    totalReviewCount: totalReviewCount ?? null,
  };
}
