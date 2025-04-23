import { prisma } from "./../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const videos = await prisma.videos.findMany({
    where: { afficher: true },
    orderBy: { date: "desc" },
    take: 4,
    select: {
      id_vid: true,
      titre: true,
      derniere_modification: true,
      lien: true,
      description: true,
      videos_tags_link: {
        select: {
          videos_tags: {
            select: {
              titre: true,
            },
          },
        },
      },
    },
  });

  // Transformer les données pour le format attendu par le composant front-end
  const cleanedVideos = videos.map((video) => ({
    id_vid: video.id_vid,
    titre: video.titre,
    derniere_modification: video.derniere_modification,
    lien: video.lien,
    description: video.description,
    tags: video.videos_tags_link.map((tagLink) => tagLink.videos_tags.titre),
  }));

  return NextResponse.json(cleanedVideos);
}
