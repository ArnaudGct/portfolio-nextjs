import { prisma } from "./../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const albums = await prisma.photos_albums.findMany({
      where: { afficher: true },
      orderBy: { date: "desc" },
      select: {
        id_alb: true,
        titre: true,
        description: true,
        date: true,
        photos_albums_link: {
          select: {
            photos: {
              select: {
                lien_low: true,
                largeur: true,
                hauteur: true,
              },
            },
          },
        },
        photos_albums_tags_link: {
          select: {
            photos_tags: {
              select: {
                titre: true,
              },
            },
          },
        },
      },
    });

    // Transformation des données pour obtenir un format simplifié
    const cleanedAlbums = albums.map((album) => ({
      id_alb: album.id_alb,
      titre: album.titre,
      description: album.description,
      date: album.date,
      photos: album.photos_albums_link.map((photoLink) => ({
        lien_low: photoLink.photos.lien_low,
        largeur: photoLink.photos.largeur,
        hauteur: photoLink.photos.hauteur,
      })),
      tags: album.photos_albums_tags_link.map(
        (tagLink) => tagLink.photos_tags.titre
      ),
    }));

    return NextResponse.json(cleanedAlbums);
  } catch (error) {
    console.error("Erreur lors de la récupération des albums:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des albums" },
      { status: 500 }
    );
  }
}
