import { prisma } from "./../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const photos = await prisma.photos.findMany({
      where: {
        afficher: true,
        photos_albums_link: {
          none: {}, // aucune relation avec un album
        },
      },
      orderBy: { date_ajout: "desc" },
      select: {
        id_pho: true,
        lien_high: true,
        lien_low: true,
        largeur: true,
        hauteur: true,
        date_ajout: true,
        photos_tags_link: {
          select: {
            photos_tags: {
              select: {
                titre: true,
              },
            },
          },
        },
        photos_tags_recherche_link: {
          select: {
            photos_tags_recherche: {
              select: {
                titre: true,
              },
            },
          },
        },
      },
    });

    // Transformation des données pour obtenir un format simplifié
    const cleanedPhotos = photos.map((photo) => ({
      id_pho: photo.id_pho,
      lien_high: photo.lien_high,
      lien_low: photo.lien_low,
      largeur: photo.largeur,
      hauteur: photo.hauteur,
      date_ajout: photo.date_ajout,
      tags: photo.photos_tags_link.map((tagLink) => tagLink.photos_tags.titre),
      tags_recherche: photo.photos_tags_recherche_link.map(
        (tagLink) => tagLink.photos_tags_recherche.titre
      ),
    }));

    return NextResponse.json(cleanedPhotos);
  } catch (error) {
    console.error("Erreur lors de la récupération des photos:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des photos" },
      { status: 500 }
    );
  }
}
