import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const outilsData = await prisma.outils.findMany({
      orderBy: { titre: "asc" },
      select: {
        id_outil: true,
        titre: true,
        description: true,
        logo: true,
        miniature: true,
        lien_github: true,
        derniere_modification: true,
      },
    });

    const links = await prisma.outils_tags_link.findMany();
    const tags = await prisma.outils_tags.findMany();

    const outils = outilsData.map((outil) => {
      const outilLinks = links.filter((l) => l.id_outils === outil.id_outil);
      const outilTags = outilLinks
        .map((l) => tags.find((t) => t.id_tags === l.id_tags))
        .filter(Boolean);

      return {
        ...outil,
        tags: outilTags.map((t) => ({
          titre: t.titre,
          important: t.important === 1,
        })),
      };
    });

    return NextResponse.json(outils);
  } catch (error) {
    console.error("Erreur lors de la récupération des outils:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des outils" },
      { status: 500 },
    );
  }
}
