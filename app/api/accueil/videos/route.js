import { prisma } from "./../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const selectFields = {
    id_vid: true,
    titre: true,
    derniere_modification: true,
    lien: true,
    description: true,
    date: true,
    videos_tags_link: {
      select: {
        videos_tags: {
          select: {
            titre: true,
          },
        },
      },
    },
  };

  // 1. Récupérer les vidéos avec afficher_accueil: true
  const featuredVideos = await prisma.videos.findMany({
    where: {
      afficher: true,
      afficher_accueil: true,
    },
    orderBy: { ordre_accueil: "asc" },
    select: selectFields,
  });

  let videos = [...featuredVideos];

  // 2. Si moins de 4 vidéos avec afficher_accueil, compléter avec les dernières réalisations
  if (videos.length < 4) {
    const remainingCount = 4 - videos.length;
    const featuredIds = videos.map((v) => v.id_vid);

    const recentVideos = await prisma.videos.findMany({
      where: {
        afficher: true,
        id_vid: { notIn: featuredIds },
      },
      orderBy: { date: "desc" },
      take: remainingCount,
      select: selectFields,
    });

    videos = [...videos, ...recentVideos];
  } else {
    // Limiter à 4 si plus de vidéos featured
    videos = videos.slice(0, 4);
  }

  // Transformer les données pour le format attendu par le composant front-end
  const cleanedVideos = videos.map((video) => ({
    id_vid: video.id_vid,
    titre: video.titre,
    derniere_modification: video.derniere_modification,
    lien: video.lien,
    description: video.description,
    date: video.date,
    tags: video.videos_tags_link.map((tagLink) => tagLink.videos_tags.titre),
  }));

  return NextResponse.json(cleanedVideos);
}
