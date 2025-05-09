import { prisma } from "../../../lib/prisma"; // Adjust the import path as necessary
import { NextResponse } from "next/server";

export async function GET() {
  const experiences = await prisma.experiences.findMany({
    where: { afficher: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(experiences);
}
