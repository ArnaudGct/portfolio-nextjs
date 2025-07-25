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
        lien_cover: true,
        date: true,
        afficher: true,
        derniere_modification: true,
        photos_albums_link: {
          where: {
            photos: {
              afficher: true,
            },
          },
          select: {
            photos: {
              select: {
                lien_low: true,
                largeur: true,
                hauteur: true,
                alt: true,
                afficher: true,
              },
            },
          },
          orderBy: {
            // Trier par position au lieu de la date des photos
            position: "asc",
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
      lien_cover: album.lien_cover,
      date: album.date,
      afficher: album.afficher,
      derniere_modification: album.derniere_modification,
      photos: album.photos_albums_link.map((photoLink) => ({
        lien_low: photoLink.photos.lien_low,
        largeur: photoLink.photos.largeur,
        hauteur: photoLink.photos.hauteur,
        alt: photoLink.photos.alt,
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
