import { PrismaClient } from "../prisma/app/generated/prisma/client/index.js";
import { syncTrustpilotReviews } from "../lib/trustpilot/sync-reviews.mjs";

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const prisma = new PrismaClient();

try {
  const result = await syncTrustpilotReviews(prisma);
  console.log(
    `Synchronisation Trustpilot réussie : ${result.syncedReviews} avis sur ${result.totalReviewCount ?? "un total inconnu"}.`,
  );
} catch (error) {
  console.error("Échec de la synchronisation Trustpilot :", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
