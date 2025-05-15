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
        miniature: true,
        lien_github: true,
        lien_figma: true,
        lien_site: true,
        categorie: true,
        date: true,
        afficher: true,
        derniere_modification: true,
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
      miniature: autre.miniature,
      lien_github: autre.lien_github,
      lien_figma: autre.lien_figma,
      lien_site: autre.lien_site,
      categorie: autre.categorie,
      date: autre.date,
      afficher: autre.afficher,
      derniere_modification: autre.derniere_modification,
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
