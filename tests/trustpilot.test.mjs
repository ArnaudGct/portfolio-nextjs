import test from "node:test";
import assert from "node:assert/strict";
import { parseTrustpilotPage } from "../lib/trustpilot/parse-reviews.mjs";

function fixture(change = () => {}) {
  const data = {
    businessUnit: { identifyingName: "arnaudgct.fr" },
    filters: { selected: { languages: "all" }, totalNumberOfReviews: 1,
      pagination: { currentPage: 1, totalPages: 1, totalCount: 1 } },
    reviews: [{ id: "1234567890abcdef12345678", consumer: { displayName: "Client test" },
      text: "Première ligne.\nDeuxième ligne.", title: "Titre", rating: 5,
      dates: { publishedDate: "2026-10-24T10:00:00Z" } }],
  };
  change(data);
  return `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: data } })}</script>`;
}

test("extrait les données structurées et conserve les sauts de ligne", () => {
  const result = parseTrustpilotPage(fixture());
  assert.equal(result.totalReviewCount, 1);
  assert.equal(result.reviews[0].contenu, "Première ligne.\nDeuxième ligne.");
  assert.equal(result.reviews[0].reviewUrl, "https://fr.trustpilot.com/reviews/1234567890abcdef12345678");
  assert.equal(result.reviews[0].datePublication.toISOString(), "2026-10-24T10:00:00.000Z");
});

test("une page anti-bot n'est jamais une liste vide réussie", () => {
  assert.throws(() => parseTrustpilotPage("<h1>Verifying Connection</h1>"), /bloquée/);
});

test("refuse une autre entreprise, une liste filtrée ou des compteurs invalides", () => {
  for (const change of [
    d => { d.businessUnit.identifyingName = "example.com"; },
    d => { d.filters.selected.languages = "fr"; },
    d => { d.filters.pagination.totalCount = 0; },
    d => { d.filters.totalNumberOfReviews = 2; },
  ]) assert.throws(() => parseTrustpilotPage(fixture(change)));
});

test("refuse les données corrompues et doublons avant toute écriture", () => {
  for (const change of [
    d => { d.reviews[0].rating = 6; },
    d => { d.reviews[0].dates.publishedDate = "invalide"; },
    d => { d.reviews[0].id = "invalide"; },
    d => { d.reviews.push(d.reviews[0]); },
    d => { d.reviews = []; },
  ]) assert.throws(() => parseTrustpilotPage(fixture(change)));
});
