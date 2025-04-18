import { prisma } from "./../../../../lib/prisma"; // Adjust the import path as necessary
import { NextResponse } from "next/server";

export async function GET() {
  const autres = await prisma.autre.findMany({
    where: { afficher: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(autres);
}
