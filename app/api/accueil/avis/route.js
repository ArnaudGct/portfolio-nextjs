import { prisma } from "../../../../lib/prisma"; // Adjust the import path as necessary
import { NextResponse } from "next/server";

export async function GET() {
  const aviss = await prisma.avis.findMany({
    where: { afficher: true },
  });

  return NextResponse.json(aviss);
}
