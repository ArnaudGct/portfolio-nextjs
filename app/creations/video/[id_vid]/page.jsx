// app/creations/album/[id_alb]/page.jsx
import { PrismaClient } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import AlbumsGallery from "../../../../src/sections/creations/Photos/AlbumsGallery";
import Breadcrumb from "../../../../src/components/Breadcrumb";
import VideosGallery from "../../../../src/sections/creations/Videos/VideosGallery";

const prisma = new PrismaClient();

async function getVideoDetails(id_vid) {
  try {
    const video = await prisma.videos.findUnique({
      where: { id_vid: parseInt(id_vid) },
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
    return video;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function VideoDetails({ params, searchParams }) {
  const { id_vid } = await params;
  const video = await getVideoDetails(id_vid);

  const { from } = await searchParams; // <= ici on récupère "from"

  const backLink = from === "home" ? "/" : "/creations";
  const backLinkText = from === "home" ? "Accueil" : "Mes créations";

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-semibold text-gray-500">
          Vidéo non trouvé
        </h2>
        <Link
          href={backLink}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft size={16} /> Retour aux albums
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-450px)]">
      <div className="flex flex-col w-[90%] mx-auto max-w-[1440px] gap-10 mt-20 mb-20">
        <Breadcrumb
          pages={[
            { name: backLinkText, path: backLink }, // Pas de `{}` autour des variables
            {
              name: video.titre,
              path: `${backLink}/video/${video.id_vid}`, // Correction ici aussi, pas de `${{ backLink }}`
            },
          ]}
        />

        <VideosGallery video={video} />
      </div>
      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-t from-[#dfe7ff]/0 to-[#dfe7ff]/75 pointer-events-none"></div>
    </main>
  );
}
