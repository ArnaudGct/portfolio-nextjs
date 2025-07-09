import { PrismaClient } from "../../../../prisma/app/generated/prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const aproposData = await prisma.apropos_general.findFirst();

    if (!aproposData) {
      return Response.json({ error: "Aucune donnée trouvée" }, { status: 404 });
    }

    return Response.json(aproposData);
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
