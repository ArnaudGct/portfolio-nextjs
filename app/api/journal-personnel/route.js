import { prisma } from "../../../lib/prisma"; // Adjust the import path as necessary
import { NextResponse } from "next/server";

export async function GET() {
  const experiences = await prisma.experiences.findMany({
    where: { afficher: true, categorie: "personnel" },
    orderBy: { date_debut: "desc" },
  });

  return NextResponse.json(experiences);
}
