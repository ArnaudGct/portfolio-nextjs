import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Breadcrumb from "../../../src/components/Breadcrumb";
import OutilGallery from "../../../src/sections/outils/OutilGallery";

async function getOutilDetails(id_outil) {
  try {
    const outilData = await prisma.outils.findUnique({
      where: { id_outil: parseInt(id_outil) },
      select: {
        id_outil: true,
        titre: true,
        description: true,
        logo: true,
        miniature: true,
        lien_github: true,
        lien_telechargement: true,
        derniere_modification: true,
      },
    });

    if (!outilData) return null;

    const links = await prisma.outils_tags_link.findMany({
      where: { id_outils: parseInt(id_outil) },
    });

    const tagIds = links.map((l) => l.id_tags);
    const tags = await prisma.outils_tags.findMany({
      where: { id_tags: { in: tagIds } },
    });

    const outilTags = links
      .map((l) => tags.find((t) => t.id_tags === l.id_tags))
      .filter(Boolean);

    return {
      ...outilData,
      tags: outilTags.map((t) => ({
        titre: t.titre,
        important: t.important === 1,
      })),
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default async function OutilDetails({ params }) {
  const { id } = await params;
  const outil = await getOutilDetails(id);

  if (!outil) {
    return (
      <div className="flex flex-col items-center justify-center h-96 pt-24">
        <h2 className="text-2xl font-semibold text-slate-500">
          Outil non trouvé
        </h2>
        <Link
          href="/outils"
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft size={16} /> Retour aux outils
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-450px)] relative">
      <div className="flex flex-col w-[90%] mx-auto max-w-[1440px] gap-10 pt-24 pb-20 z-10 relative">
        <Breadcrumb
          pages={[
            { name: "Outils", path: "/outils" },
            { name: outil.titre, path: `/outils/${outil.id_outil}` },
          ]}
        />

        <OutilGallery outil={outil} />
      </div>
      <div className="absolute top-0 left-0 w-full h-14 bg-linear-to-t from-blue-100/0 to-blue-100/75 pointer-events-none z-0"></div>
    </main>
  );
}
