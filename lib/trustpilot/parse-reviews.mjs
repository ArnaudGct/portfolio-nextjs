import { parse } from "node-html-parser";
import { validateTrustpilotPayload } from "./store-reviews.mjs";

export function parseTrustpilotPage(rawHtml) {
  const script = parse(rawHtml || "").querySelector("script#__NEXT_DATA__");
  if (!script) throw new Error("Page Trustpilot illisible ou bloquée : __NEXT_DATA__ absent");
  const data = JSON.parse(script.textContent)?.props?.pageProps;
  if (data?.businessUnit?.identifyingName !== "arnaudgct.fr") {
    throw new Error("La page Trustpilot ne correspond pas à arnaudgct.fr");
  }
  const pagination = data.filters?.pagination;
  if (!pagination || !Number.isInteger(pagination.currentPage) || pagination.currentPage < 1 ||
      !Number.isInteger(pagination.totalPages) || pagination.totalPages < pagination.currentPage ||
      !Number.isInteger(pagination.totalCount) || pagination.totalCount < 1 ||
      data.filters?.selected?.languages !== "all" ||
      data.filters?.totalNumberOfReviews !== pagination.totalCount) {
    throw new Error("Pagination Trustpilot invalide ou liste filtrée");
  }
  if (!Array.isArray(data.reviews)) throw new Error("Liste des avis Trustpilot absente");
  const payload = validateTrustpilotPayload({
    totalReviewCount: pagination.totalCount,
    reviews: data.reviews.map((review) => ({
      id: review.id,
      client: review.consumer?.displayName,
      contenu: review.text?.trim() || review.title,
      rating: review.rating,
      datePublication: review.dates?.publishedDate,
    })),
  });
  return { ...payload, currentPage: pagination.currentPage, totalPages: pagination.totalPages };
}
