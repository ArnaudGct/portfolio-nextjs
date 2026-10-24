import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { storeTrustpilotReviews, validateTrustpilotPayload } from "../../../../../lib/trustpilot/store-reviews.mjs";

export const runtime = "nodejs";

export async function POST(request) {
  const expected = process.env.API_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!expected || !supplied || Buffer.byteLength(expected) !== Buffer.byteLength(supplied) ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  let payload;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > 2_000_000) {
      return NextResponse.json({ error: "Synchronisation trop volumineuse" }, { status: 413 });
    }
    payload = validateTrustpilotPayload(JSON.parse(body));
  } catch {
    return NextResponse.json({ error: "Données Trustpilot invalides" }, { status: 400 });
  }
  try {
    const result = await storeTrustpilotReviews(prisma, payload);
    return NextResponse.json({ success: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Échec de l'enregistrement Trustpilot :", error);
    return NextResponse.json({ error: "Impossible d'enregistrer les avis Trustpilot" }, { status: 500 });
  }
}
