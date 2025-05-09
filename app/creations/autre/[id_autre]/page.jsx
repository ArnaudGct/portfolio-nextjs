// app/creations/album/[id_alb]/page.jsx
import { PrismaClient } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Breadcrumb from "../../../../src/components/Breadcrumb";
import AutreGallery from "../../../../src/sections/creations/Autre/AutreGallery";

const prisma = new PrismaClient();

async function getAutreDetails(id_autre) {
  try {
    const autre = await prisma.autre.findUnique({
      where: { id_autre: parseInt(id_autre) },
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
    return autre;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function AutreDetails({ params }) {
  const { id_autre } = await params;
  const autre = await getAutreDetails(id_autre);

  if (!autre) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-semibold text-gray-500">
          Vidéo non trouvé
        </h2>
        <Link
          href="/creations"
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
            { name: autre.titre, path: `/creations/autre/${autre.id_autre}` },
          ]}
        />

        <AutreGallery autre={autre} />
      </div>
      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-t from-blue-100/0 to-blue-100/75 pointer-events-none"></div>
    </main>
  );
}
