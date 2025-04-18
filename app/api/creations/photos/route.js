import { prisma } from "./../../../../lib/prisma"; // Adjust the import path as necessary
import { NextResponse } from "next/server";

export async function GET() {
  const videos = await prisma.photos.findMany({
    where: { afficher: true },
    orderBy: { date_ajout: "desc" },
  });

  return NextResponse.json(videos);
}
