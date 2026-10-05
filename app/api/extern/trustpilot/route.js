import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const frenchDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reviews = await prisma.trustpilot_reviews.findMany({
      where: { afficher: true },
      orderBy: { date_publication: "desc" },
    });

    return NextResponse.json(
      reviews.map((review) => ({
        id_tem: `trustpilot-${review.id}`,
        client: review.client,
        contenu: review.contenu,
        rating: review.rating,
        date: frenchDateFormatter.format(review.date_publication),
        reviewUrl: review.review_url,
        source: "trustpilot",
      })),
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          "X-Trustpilot-Source": "database",
        },
      },
    );
  } catch (error) {
    console.error("Erreur de lecture des avis Trustpilot en base :", error);

    return NextResponse.json(
      { error: "Impossible de charger les avis Trustpilot" },
      { status: 500 },
    );
  }
}
