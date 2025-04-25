import { prisma } from "./../../../../lib/prisma";
import { NextResponse } from "next/server";

console.log("ID reçu par l'API:", id_alb);

export async function GET(request, { params }) {
  const { id_alb } = params;

  try {
    const album = await prisma.photos_albums.findUnique({
      where: {
        id_alb: parseInt(id_alb),
      },
      include: {
        photos_albums_link: {
          select: {
            photos: {
              select: {
                id_pho: true,
                lien_low: true,
                lien_high: true,
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
                id_tag: true,
                titre: true,
              },
            },
          },
        },
      },
    });

    if (album) {
      return NextResponse.json(album);
    } else {
      return NextResponse.json(
        { message: `Album avec l'ID ${id_alb} non trouvé.` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des albums:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des albums" },
      { status: 500 }
    );
  }
}
