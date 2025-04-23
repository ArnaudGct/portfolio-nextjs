import { prisma } from "./../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const autres = await prisma.autre.findMany({
      where: { afficher: true },
      orderBy: { date: "desc" },
      select: {
        id_autre: true,
        titre: true,
        description: true,
        lien: true,
        categorie: true,
        date: true,
        autre_tags_link: {
          select: {
            autre_tags: {
              select: {
                titre: true,
                important: true,
              },
            },
          },
        },
      },
    });

    // Transformation des données pour obtenir un format simplifié
    const cleanedAutre = autres.map((autre) => ({
      id_autre: autre.id_autre,
      titre: autre.titre,
      description: autre.description,
      lien: autre.lien,
      date: autre.date,
      tags: autre.autre_tags_link.map((tagLink) => ({
        titre: tagLink.autre_tags.titre,
        important: tagLink.autre_tags.important,
      })),
    }));

    return NextResponse.json(cleanedAutre);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des autres créations:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des autres créations" },
      { status: 500 }
    );
  }
}
