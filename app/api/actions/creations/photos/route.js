import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// Vérification du token d'authentification
function isAuthenticated(request) {
  const authHeader = request.headers.get("Authorization");
  const token = process.env.API_TOKEN;

  if (!authHeader || !authHeader.startsWith("Bearer ") || !token) {
    return false;
  }

  const providedToken = authHeader.split(" ")[1];
  return providedToken === token;
}

export async function POST(request) {
  try {
    // Vérifier l'authentification
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le formData
    const formData = await request.formData();
    const image = formData.get("image");
    const type = formData.get("type") || "high";
    const baseDestination = formData.get("destination") || "uploads/photos";

    // Options de traitement
    const shouldOptimize = formData.get("optimize") === "true";
    const shouldResize = formData.get("resize") === "true";
    const convertToWebp = formData.get("convertToWebp") === "true";
    const maxWidth = parseInt(formData.get("maxWidth") || "800", 10);
    const quality = parseInt(formData.get("quality") || "70", 10);

    console.log({
      type,
      optimize: shouldOptimize,
      resize: shouldResize,
      convertToWebp,
      maxWidth,
      quality,
      imageType: image.type,
    });

    if (!image) {
      return NextResponse.json(
        { error: "Fichier image manquant" },
        { status: 400 }
      );
    }

    // Vérifier que c'est bien une image
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image", receivedType: image.type },
        { status: 400 }
      );
    }

    // Construire le chemin de destination
    const savePath =
      type === "low" ? `${baseDestination}/low` : baseDestination;

    // Créer le répertoire s'il n'existe pas
    const uploadDir = path.join(process.cwd(), "public", savePath);
    await fs.mkdir(uploadDir, { recursive: true });

    // Lire le fichier image
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Récupérer les métadonnées de l'image
    let metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch (sharpError) {
      console.error("Erreur lors de la lecture des métadonnées:", sharpError);
      metadata = { width: 0, height: 0, format: "unknown" };
    }

    // Générer un nom de fichier unique
    let originalExt = path.extname(image.name).toLowerCase() || ".jpg";
    const fileNameWithoutExt = path.basename(image.name, originalExt);
    const uniqueId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    // Si on doit convertir en WebP pour la version low-res
    if (type === "low" && convertToWebp) {
      originalExt = ".webp";
    }

    const fileName = `${fileNameWithoutExt}-${uniqueId}${originalExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Traitement différent selon le type et les options
    if (type === "high" || (!shouldResize && !shouldOptimize)) {
      // Pour les images haute résolution ou quand aucun traitement n'est demandé,
      // sauvegarder telles quelles
      await fs.writeFile(filePath, buffer);
      console.log(`Image sauvegardée sans modification: ${filePath}`);
    } else {
      // Pour les images à traiter (basse résolution ou optimisation demandée)
      try {
        // Initialiser Sharp
        let sharpInstance = sharp(buffer);

        // Redimensionner si nécessaire
        if (shouldResize && metadata.width > maxWidth) {
          const aspectRatio = metadata.width / metadata.height;
          const newHeight = Math.round(maxWidth / aspectRatio);

          sharpInstance = sharpInstance.resize({
            width: maxWidth,
            height: newHeight,
            fit: "inside",
            withoutEnlargement: true,
          });
          console.log(`Redimensionnement à ${maxWidth}x${newHeight}`);
        }

        // Appliquer le format de sortie et la compression
        if (convertToWebp) {
          sharpInstance = sharpInstance.webp({ quality });
          console.log(`Conversion en WebP avec qualité ${quality}`);
        } else if (image.type.includes("webp")) {
          sharpInstance = sharpInstance.webp({ quality });
          console.log(`Optimisation du WebP avec qualité ${quality}`);
        } else if (image.type.includes("jpeg") || image.type.includes("jpg")) {
          sharpInstance = sharpInstance.jpeg({ quality });
        } else if (image.type.includes("png")) {
          sharpInstance = sharpInstance.png({ compressionLevel: 9 });
        }

        // Sauvegarder l'image traitée
        await sharpInstance.toFile(filePath);

        // Vérifier la taille du fichier résultant
        const stats = await fs.stat(filePath);
        const fileSizeKB = stats.size / 1024;
        console.log(
          `Image traitée: ${filePath}, taille: ${fileSizeKB.toFixed(2)}KB`
        );

        // Si la taille est encore trop grande pour la version low (>300KB)
        if (type === "low" && fileSizeKB > 300) {
          console.log(
            `Image trop volumineuse (${fileSizeKB.toFixed(
              2
            )}KB), compression supplémentaire`
          );

          // Compression plus agressive
          let extraCompressedSharp = sharp(buffer).resize({
            width: Math.min(maxWidth, 600),
            height: Math.min(metadata.height, 600),
            fit: "inside",
          });

          if (convertToWebp || image.type.includes("webp")) {
            extraCompressedSharp = extraCompressedSharp.webp({
              quality: Math.max(quality - 10, 60),
            });
          } else {
            extraCompressedSharp = extraCompressedSharp.jpeg({
              quality: Math.max(quality - 10, 60),
            });
          }

          await extraCompressedSharp.toFile(filePath);
          console.log(`Compression supplémentaire effectuée`);
        }
      } catch (sharpError) {
        console.error("Erreur lors du traitement de l'image:", sharpError);
        // Fallback en cas d'erreur
        await fs.writeFile(filePath, buffer);
      }
    }

    // Construire l'URL relative de l'image
    const imageUrl = `/${savePath}/${fileName}`;

    // Obtenir les informations sur le fichier final
    const stats = await fs.stat(filePath);

    return NextResponse.json({
      success: true,
      imageUrl,
      details: {
        originalType: image.type,
        finalType: convertToWebp ? "image/webp" : image.type,
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: (stats.size / 1024).toFixed(2) + "KB",
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'upload d'image:", error);
    return NextResponse.json(
      { error: error.message || "Une erreur est survenue lors de l'upload" },
      { status: 500 }
    );
  }
}

// Ajouter un gestionnaire pour les requêtes OPTIONS (pour CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function DELETE(request) {
  try {
    // Vérifier l'authentification
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le corps de la requête
    const { imagePath } = await request.json();

    if (!imagePath || typeof imagePath !== "string") {
      return NextResponse.json(
        { error: "Chemin d'image invalide" },
        { status: 400 }
      );
    }

    // Permettre la suppression dans les deux dossiers /photos et /upload
    if (
      !imagePath.startsWith("/photos/") &&
      !imagePath.startsWith("/uploads/")
    ) {
      return NextResponse.json(
        { error: "Chemin d'image non autorisé" },
        { status: 403 }
      );
    }

    // Chemin complet du fichier - CORRECTION ICI
    const filePath = path.join(process.cwd(), "public", imagePath);

    // Utilisation de fs.unlink pour supprimer le fichier
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      // Si le fichier n'existe pas, considérer l'opération comme réussie
      if (unlinkError.code !== "ENOENT") {
        throw unlinkError;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Image supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression d'image:", error);
    return NextResponse.json(
      {
        error:
          error.message || "Une erreur est survenue lors de la suppression",
      },
      { status: 500 }
    );
  }
}
