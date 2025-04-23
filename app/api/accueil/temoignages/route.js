import { prisma } from "../../../../lib/prisma"; // Adjust the import path as necessary
import { NextResponse } from "next/server";

export async function GET() {
  const temoignages = await prisma.temoignages.findMany({
    where: { afficher: true },
  });

  return NextResponse.json(temoignages);
}
