import { prisma } from "../../../../lib/prisma"; // Adjust the import path as necessary
import { NextResponse } from "next/server";

export async function GET() {
  const videos = await prisma.creations.findMany({
    where: { afficher: true },
    orderBy: { date: "desc" },
    take: 4,
    select: {
      id_crea: true,
      titre: true,
      derniere_modification: true,
      type: true,
      lien: true,
    },
  });

  return NextResponse.json(videos);
}
