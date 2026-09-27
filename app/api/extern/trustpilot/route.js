import { NextResponse } from "next/server";
import { parse } from "node-html-parser";

const TRUSTPILOT_URL = "https://fr.trustpilot.com/review/arnaudgct.fr";
const TRUSTPILOT_READER_URL = `https://r.jina.ai/${TRUSTPILOT_URL}`;

// Une lecture par heure maximum, quel que soit le nombre de visiteurs.
export const revalidate = 3600;

function formatFrenchDate(dateString) {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function createReviewId(reviewUrl, fallback) {
  const reviewId = reviewUrl?.match(/\/reviews\/([^/?#]+)/)?.[1];
  return reviewId ? `trustpilot-${reviewId}` : `trustpilot-${fallback}`;
}

function normalizeReviewNode(review, index) {
  const reviewUrl =
    review.url || review["@id"] || review.mainEntityOfPage?.["@id"] || null;
  const author =
    typeof review.author === "string" ? review.author : review.author?.name;

  return {
    id_tem: createReviewId(reviewUrl, index),
    client: author || "Client Trustpilot",
    contenu:
      review.reviewBody || review.description || review.headline || "",
    rating: Number(review.reviewRating?.ratingValue) || 5,
    date: formatFrenchDate(review.datePublished),
    reviewUrl,
    source: "trustpilot",
  };
}

function collectReviewNodes(value, reviews = []) {
  if (!value || typeof value !== "object") return reviews;

  if (Array.isArray(value)) {
    value.forEach((item) => collectReviewNodes(item, reviews));
    return reviews;
  }

  const type = value["@type"];
  if (type === "Review" || (Array.isArray(type) && type.includes("Review"))) {
    reviews.push(value);
    return reviews;
  }

  Object.values(value).forEach((item) => collectReviewNodes(item, reviews));
  return reviews;
}

function firstMatchingNode(node, selectors) {
  for (const selector of selectors) {
    const match = node.querySelector(selector);
    if (match) return match;
  }

  return null;
}

function parseTrustpilotHtml(html) {
  const root = parse(html);
  const structuredReviews = [];

  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const json = JSON.parse(script.textContent);
      collectReviewNodes(json, structuredReviews);
    } catch {
      // Un bloc JSON-LD invalide ne doit pas empêcher l'analyse des suivants.
    }
  }

  if (structuredReviews.length > 0) {
    return structuredReviews.map(normalizeReviewNode);
  }

  const cards = root.querySelectorAll(
    'article[data-service-review-card-paper], article[data-service-review-card-paper="true"]',
  );

  return cards.map((card, index) => {
    const nameElement = firstMatchingNode(card, [
      '[data-consumer-name-typography="true"]',
      "[data-consumer-name-typography]",
    ]);
    const contentElement = firstMatchingNode(card, [
      '[data-service-review-text-typography="true"]',
      "[data-service-review-text-typography]",
    ]);
    const ratingElement = firstMatchingNode(card, [
      "[data-service-review-rating]",
      'img[alt*="sur 5"]',
    ]);
    const reviewLink = card.querySelector('a[href*="/reviews/"]');
    const reviewUrl = reviewLink
      ? new URL(reviewLink.getAttribute("href"), TRUSTPILOT_URL).toString()
      : null;
    const ratingText =
      ratingElement?.getAttribute("data-service-review-rating") ||
      ratingElement?.getAttribute("alt") ||
      "";
    const dateElement = card.querySelector("time");

    return {
      id_tem: createReviewId(reviewUrl, index),
      client: nameElement?.textContent?.trim() || "Client Trustpilot",
      contenu: contentElement?.textContent?.trim() || "",
      rating:
        Number(ratingText.match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(",", ".")) ||
        5,
      date: formatFrenchDate(
        dateElement?.getAttribute("datetime") || dateElement?.textContent?.trim(),
      ),
      reviewUrl,
      source: "trustpilot",
    };
  });
}

function parseTrustpilotMarkdown(markdown) {
  const reviewsSection = markdown.includes("## Tous les avis")
    ? markdown.slice(markdown.lastIndexOf("## Tous les avis"))
    : markdown;
  const authorPattern =
    /^\[([^\]\n]+?)\s+[A-Z]{2}•[\d\s]+ avis?\]\(https:\/\/[^)\s]+\/users\/([^)]+)\)\s*$/gm;
  const matches = [...reviewsSection.matchAll(authorPattern)];

  return matches
    .map((authorMatch, index) => {
      const start = authorMatch.index + authorMatch[0].length;
      const end = matches[index + 1]?.index ?? reviewsSection.length;
      const block = reviewsSection.slice(start, end);
      const titleMatch = block.match(
        /^## \[([^\]]+)\]\((https:\/\/[^)]+\/reviews\/([^)/?#]+)[^)]*)\)\s*$/m,
      );

      if (!titleMatch) return null;

      const ratingMatch = block.match(/Noté\s+(\d+(?:[.,]\d+)?)\s+sur\s+5/i);
      const displayedDate = block.match(
        /\b\d{1,2}\s+\p{L}{3,12}\.?\s+\d{4}\b/u,
      )?.[0];
      const contentStart = titleMatch.index + titleMatch[0].length;
      let contentBlock = block.slice(contentStart);
      const contentEndCandidates = [
        contentBlock.search(/\nAvis\s+(?:spontané|vérifié|sur invitation)/i),
        contentBlock.search(/\nUtile\s*\n/i),
      ].filter((position) => position >= 0);

      if (contentEndCandidates.length > 0) {
        contentBlock = contentBlock.slice(0, Math.min(...contentEndCandidates));
      }

      const contentLines = contentBlock
        .split("\n")
        .map((line) => line.trimEnd());

      while (contentLines.length > 0 && !contentLines[0].trim()) {
        contentLines.shift();
      }
      while (contentLines.length > 0 && !contentLines.at(-1).trim()) {
        contentLines.pop();
      }

      // La dernière date correspond à la date d'expérience, pas au témoignage.
      if (
        contentLines.length > 0 &&
        /^\d{1,2}\s+\p{L}{3,12}\.?\s+\d{4}$/u.test(
          contentLines.at(-1).trim(),
        )
      ) {
        contentLines.pop();
      }

      return {
        id_tem: createReviewId(titleMatch[2], titleMatch[3]),
        client: authorMatch[1].trim(),
        contenu: contentLines.join("\n").trim(),
        rating: Number(ratingMatch?.[1]?.replace(",", ".")) || 5,
        date: displayedDate || null,
        reviewUrl: titleMatch[2],
        source: "trustpilot",
      };
    })
    .filter(Boolean);
}

function cleanReviews(reviews) {
  const seen = new Set();

  return reviews.filter((review) => {
    if (!review.contenu || seen.has(review.id_tem)) return false;
    seen.add(review.id_tem);
    return true;
  });
}

async function fetchReaderReviews() {
  const response = await fetch(TRUSTPILOT_READER_URL, {
    headers: {
      Accept: "text/plain",
      "User-Agent": "arnaudgct.fr/1.0",
    },
    next: { revalidate },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Lecteur Trustpilot indisponible (${response.status})`);
  }

  return cleanReviews(parseTrustpilotMarkdown(await response.text()));
}

async function fetchDirectReviews() {
  const response = await fetch(TRUSTPILOT_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "fr-FR,fr;q=0.9",
    },
    next: { revalidate },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Trustpilot a répondu ${response.status}`);
  }

  return cleanReviews(parseTrustpilotHtml(await response.text()));
}

export async function GET() {
  let source = "unavailable";
  let reviews = [];

  try {
    reviews = await fetchReaderReviews();
    source = "reader";

    if (reviews.length === 0) {
      reviews = await fetchDirectReviews();
      source = "direct";
    }
  } catch (readerError) {
    console.error("Erreur du lecteur Trustpilot:", readerError);

    try {
      reviews = await fetchDirectReviews();
      source = "direct";
    } catch (directError) {
      console.error("Erreur de lecture directe Trustpilot:", directError);
    }
  }

  return NextResponse.json(reviews, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Trustpilot-Source": source,
    },
  });
}
