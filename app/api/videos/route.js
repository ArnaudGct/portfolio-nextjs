import { prisma } from "./../../../lib/prisma"; // Adjust the import path as necessary
import { NextResponse } from "next/server";

export async function GET() {
  const videos = await prisma.creations.findMany({
    where: { afficher: true },
    orderBy: { derniere_modification: "desc" },
    take: 4,
  });

  return NextResponse.json(videos);
}
