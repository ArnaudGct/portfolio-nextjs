import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Configuration commune
const validateAuth = (request) => {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (token !== process.env.API_TOKEN) {
    return false;
  }
  return true;
};

// Gestion de l'upload (méthode POST)
export async function POST(request) {
  // Vérifier l'authentification
  if (!validateAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !file.name) {
      return NextResponse.json(
        { error: "Fichier non fourni" },
        { status: 400 }
      );
    }

    // Créer un nom de fichier unique pour éviter les collisions
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${uuidv4()}${path.extname(file.name)}`;

    // S'assurer que le répertoire existe
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "journal-personnel"
    );
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // Chemin du fichier à enregistrer
    const filePath = path.join(uploadDir, fileName);

    // Écrire le fichier
    await writeFile(filePath, buffer);

    // Construire l'URL relative à retourner
    const imageUrl = `/uploads/journal-personnel/${fileName}`;

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json(
      { error: "Échec du traitement de l'image: " + error.message },
      { status: 500 }
    );
  }
}

// Gestion de la suppression (méthode DELETE)
export async function DELETE(request) {
  // Vérifier l'authentification
  if (!validateAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Récupérer les données JSON
    const { imagePath } = await request.json();

    if (!imagePath || typeof imagePath !== "string") {
      return NextResponse.json(
        { error: "Chemin d'image invalide" },
        { status: 400 }
      );
    }

    // Vérifier que le chemin est dans le dossier uploads pour des raisons de sécurité
    if (!imagePath.startsWith("/uploads/")) {
      return NextResponse.json(
        { error: "Chemin d'image non autorisé" },
        { status: 403 }
      );
    }

    // Construire le chemin complet
    const fullPath = path.join(process.cwd(), "public", imagePath);

    // Vérifier si le fichier existe
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le fichier
    await unlink(fullPath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json(
      { error: "Échec de la suppression: " + error.message },
      { status: 500 }
    );
  }
}
