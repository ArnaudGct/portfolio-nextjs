import { fetchTrustpilotReviews } from "../lib/trustpilot/browser.mjs";

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

try {
  const baseUrl = process.env.TRUSTPILOT_SITE_URL || "https://arnaudgct.fr";
  const endpoint = new URL("/api/actions/trustpilot/sync", baseUrl);
  if (endpoint.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname)) {
    throw new Error("La synchronisation distante nécessite HTTPS");
  }
  if (!process.env.API_TOKEN) throw new Error("API_TOKEN est absent");
  // Vérifier la présence de la route avant de lancer le navigateur.
  const probe = await fetch(endpoint, { method: "POST", redirect: "error", signal: AbortSignal.timeout(30000) });
  if (probe.status !== 401) throw new Error(`La route de synchronisation n'est pas prête (HTTP ${probe.status})`);
  const { reviews, totalReviewCount } = await fetchTrustpilotReviews();
  const response = await fetch(endpoint, {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(60000),
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reviews, totalReviewCount }),
  });
  if (!response.ok) throw new Error(`Le portfolio a refusé la synchronisation (HTTP ${response.status})`);
  const result = await response.json();
  if (!result.success || result.syncedReviews !== reviews.length) throw new Error("Confirmation d'enregistrement invalide");
  console.log(`Trustpilot : ${result.syncedReviews} avis enregistrés sur le portfolio.`);
} catch (error) {
  // Ne pas journaliser les objets HTTP/SDK : ils peuvent contenir des en-têtes.
  console.error("Échec de la synchronisation Trustpilot :", error.message);
  process.exitCode = 1;
}
