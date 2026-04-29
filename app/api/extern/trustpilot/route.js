import { NextResponse } from "next/server";
import { parse } from "node-html-parser";

// Cache de 1 heure pour éviter de surcharger Trustpilot
export const revalidate = 3600;

function formatFrenchDate(dateString) {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
}

function mapReviewNode(review, index) {
  return {
    id_tem: `trustpilot-${index}`,
    client: review.author?.name || "Client Trustpilot",
    contenu: review.reviewBody || review.description || review.headline || "",
    rating: Number(review.reviewRating?.ratingValue) || 5,
    date: formatFrenchDate(review.datePublished),
    source: "trustpilot",
  };
}

export async function GET() {
  try {
    // URL de la page Trustpilot à scraper
    const trustpilotUrl = "https://fr.trustpilot.com/review/arnaudgct.fr";

    const response = await fetch(trustpilotUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      next: { revalidate },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Impossible de récupérer la page Trustpilot" },
        { status: response.status },
      );
    }

    const html = await response.text();
    const root = parse(html);

    // Rechercher le script JSON-LD qui contient les données structurées
    const scripts = root.querySelectorAll('script[type="application/ld+json"]');
    let reviews = [];

    for (const script of scripts) {
      try {
        const jsonData = JSON.parse(script.textContent);

        // Trustpilot expose désormais souvent les avis dans @graph avec des nœuds Review.
        if (Array.isArray(jsonData["@graph"])) {
          const reviewNodes = jsonData["@graph"].filter((node) => {
            const nodeType = node?.["@type"];
            return (
              nodeType === "Review" ||
              (Array.isArray(nodeType) && nodeType.includes("Review"))
            );
          });

          if (reviewNodes.length > 0) {
            reviews = reviewNodes.map(mapReviewNode);
            break;
          }
        }

        // Ancien format Schema.org encore supporté selon les pages.
        if (jsonData["@type"] === "Product" && Array.isArray(jsonData.review)) {
          reviews = jsonData.review.map(mapReviewNode);
          break;
        }
      } catch (e) {
        console.error("Erreur parsing JSON-LD:", e);
      }
    }

    // Si pas de reviews via JSON-LD, essayer de scraper directement le HTML
    if (reviews.length === 0) {
      const reviewCards = root.querySelectorAll(
        'article[data-service-review-card-paper="true"]',
      );

      reviews = Array.from(reviewCards).map((card, index) => {
        // Récupérer le nom du client
        const nameElement = card.querySelector(
          '[data-consumer-name-typography="true"]',
        );
        const client = nameElement?.textContent?.trim() || "Client Trustpilot";

        // Récupérer le contenu de l'avis
        const contentElement = card.querySelector(
          '[data-service-review-text-typography="true"]',
        );
        const contenu = contentElement?.textContent?.trim() || "";

        // Récupérer la note (nombre d'étoiles remplies)
        const ratingElement = card.querySelector(
          "[data-service-review-rating]",
        );
        const ratingAttr = ratingElement?.getAttribute(
          "data-service-review-rating",
        );
        const rating = ratingAttr ? parseInt(ratingAttr) : 5;

        // Récupérer la date
        const dateElement = card.querySelector("time");
        let formattedDate = null;
        if (dateElement) {
          const datetime = dateElement.getAttribute("datetime");
          if (datetime) {
            try {
              const date = new Date(datetime);
              formattedDate = date.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
            } catch (e) {
              formattedDate = dateElement.textContent?.trim() || null;
            }
          }
        }

        return {
          id_tem: `trustpilot-${index}`,
          client,
          contenu,
          rating: Number(rating) || 5,
          date: formattedDate,
          source: "trustpilot",
        };
      });
    }

    // Filtrer les avis vides
    reviews = reviews.filter((r) => r.contenu && r.contenu.length > 0);

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("❌ Erreur scraping Trustpilot:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du scraping Trustpilot",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
