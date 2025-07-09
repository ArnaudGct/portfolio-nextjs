import { PrismaClient } from "../../../../prisma/app/generated/prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const outilsData = await prisma.apropos_outils.findMany({
      where: {
        afficher: true,
      },
      orderBy: {
        id_outil: "asc",
      },
    });

    return Response.json(outilsData);
  } catch (error) {
    console.error("Erreur lors de la récupération des outils:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
