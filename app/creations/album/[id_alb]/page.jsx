// app/creations/album/[id_alb]/page.jsx
import { prisma } from "../../../../lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import AlbumsGallery from "../../../../src/sections/creations/Photos/AlbumsGallery";
import Breadcrumb from "../../../../src/components/Breadcrumb";

async function getAlbumDetails(id_alb) {
  try {
    const album = await prisma.photos_albums.findUnique({
      where: { id_alb: parseInt(id_alb), afficher: true },
      select: {
        id_alb: true,
        titre: true,
        description: true,
        date: true,
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
                lien_high: true,
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
                id_tags: true,
                titre: true,
              },
            },
          },
        },
      },
    });
    return album;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function AlbumDetails({ params }) {
  const { id_alb } = await params;
  const album = await getAlbumDetails(id_alb);

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const formatted = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date);

    // Capitaliser la première lettre
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-semibold text-slate-500">
          Album non trouvé
        </h2>
        <Link
          href="/creations/photos"
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft size={16} /> Retour aux albums
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-450px)]">
      <div className="flex flex-col w-[90%] mx-auto max-w-[1440px] gap-10 mt-20 pb-20">
        <Breadcrumb
          pages={[
            { name: "Mes créations", path: "/creations" },
            { name: album.titre, path: `/creations/album/${album.id_alb}` },
          ]}
        />

        <div className="flex flex-col gap-8">
          <div>
            <p className="text-3xl font-extrabold font-rethink-sans text-blue-600">
              {album.titre}
            </p>

            {album.description && (
              <p className="text-lg text-blue-900">{album.description}</p>
            )}

            <div className="flex items-center gap-1 mt-2 text-sm text-blue-400">
              {album.date && (
                <p className="flex items-center gap-2">
                  {formatDate(album.date)}
                </p>
              )}
              <span className="text-blue-400"> - </span>
              <div className="flex items-center gap-2">
                <span>
                  {album.photos_albums_link.length} photo
                  {album.photos_albums_link.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <AlbumsGallery album={album} />
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-t from-blue-100/0 to-blue-100/75 pointer-events-none"></div>
    </main>
  );
}
