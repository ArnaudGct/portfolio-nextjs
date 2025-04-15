import { prisma } from "../../../../lib/prisma"; // Adjust the import path as necessary
import { NextResponse } from "next/server";

export async function GET() {
  const questions = await prisma.faq.findMany({
    where: { afficher: true },
  });

  return NextResponse.json(questions);
}
