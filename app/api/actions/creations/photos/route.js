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
    const type = formData.get("type") || "high"; // "high" ou "low"
    const baseDestination = formData.get("destination") || "uploads/photos";

    // Options de traitement
    const shouldOptimize = formData.get("optimize") === "true"; // Généralement true
    const shouldResize = formData.get("resize") === "true"; // Généralement true
    const convertToWebp = formData.get("convertToWebp") === "true"; // Crucial pour la demande
    // const forceWebp = formData.get("forceWebp") === "true"; // Moins pertinent avec la nouvelle logique, convertToWebp suffit
    const maxWidth = parseInt(
      formData.get("maxWidth") || (type === "high" ? "2000" : "400"),
      10
    );
    const quality = parseInt(
      formData.get("quality") || (type === "high" ? "80" : "75"),
      10
    );

    console.log({
      type,
      optimize: shouldOptimize,
      resize: shouldResize,
      convertToWebp,
      maxWidth,
      quality,
      imageType: image.type,
      imageName: image.name,
    });

    if (!image) {
      return NextResponse.json(
        { error: "Fichier image manquant" },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image", receivedType: image.type },
        { status: 400 }
      );
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch (sharpError) {
      console.error(
        "Erreur lors de la lecture des métadonnées Sharp:",
        sharpError
      );
      return NextResponse.json(
        { error: "Impossible de lire les métadonnées de l'image" },
        { status: 400 }
      );
    }

    const originalFileExtFromFileName =
      path.extname(image.name).toLowerCase() || `.${metadata.format || "jpg"}`;
    const fileNameWithoutExt = path.basename(
      image.name,
      originalFileExtFromFileName
    );
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    // Déterminer l'extension et le nom du fichier traité (celui qui sera utilisé par la DB)
    let processedFileExt = originalFileExtFromFileName;
    if (convertToWebp) {
      processedFileExt = ".webp";
    } else if (
      type === "high" &&
      (image.type.includes("webp") || metadata.format === "webp")
    ) {
      // Si c'est déjà WebP et qu'on ne force pas une autre conversion, on garde WebP
      processedFileExt = ".webp";
    }

    const processedFileName = `${fileNameWithoutExt}-${uniqueId}${processedFileExt}`;
    const processedImageSubDir =
      type === "low" ? `${baseDestination}/low` : baseDestination;
    const processedImageDir = path.join(
      process.cwd(),
      "public",
      processedImageSubDir
    );
    await fs.mkdir(processedImageDir, { recursive: true });
    const processedImageFilePath = path.join(
      processedImageDir,
      processedFileName
    );

    // Sauvegarde de l'image originale pour type === "high" (sécurité)
    if (type === "high") {
      const originalBackupDir = path.join(
        process.cwd(),
        "public",
        baseDestination,
        "originals"
      );
      await fs.mkdir(originalBackupDir, { recursive: true });
      const backupFileName = `${fileNameWithoutExt}-${uniqueId}${originalFileExtFromFileName}`;
      const originalBackupFilePath = path.join(
        originalBackupDir,
        backupFileName
      );
      try {
        await fs.writeFile(originalBackupFilePath, buffer);
        console.log(
          `Image originale sauvegardée (sécurité): ${originalBackupFilePath}`
        );
      } catch (backupError) {
        console.error(
          "Erreur lors de la sauvegarde de l'image originale:",
          backupError
        );
        // Continuer même si la sauvegarde de l'original échoue
      }
    }

    // Traitement de l'image avec Sharp
    let sharpInstance = sharp(buffer);
    let finalMimeType = image.type;

    // Redimensionnement commun (si activé et nécessaire)
    if (shouldResize && metadata.width && metadata.width > maxWidth) {
      sharpInstance = sharpInstance.resize({
        width: maxWidth,
        fit: "inside",
        withoutEnlargement: true,
      });
      console.log(`Redimensionnement appliqué à ${maxWidth}px de largeur max.`);
    }

    if (type === "high") {
      if (convertToWebp) {
        sharpInstance = sharpInstance.webp({ quality: quality });
        finalMimeType = "image/webp";
        console.log(`Image HIGH convertie en WebP avec qualité ${quality}`);
      } else {
        // Fallback: optimiser le format original si pas de conversion WebP demandée
        if (metadata.format === "jpeg") {
          sharpInstance = sharpInstance.jpeg({ quality: quality });
          finalMimeType = "image/jpeg";
        } else if (metadata.format === "png") {
          sharpInstance = sharpInstance.png({
            quality: Math.floor(quality / 10),
          }); // Sharp PNG quality 0-9
          finalMimeType = "image/png";
        } else if (metadata.format === "webp") {
          // Si déjà webp, ré-encoder avec la qualité
          sharpInstance = sharpInstance.webp({ quality: quality });
          finalMimeType = "image/webp";
        }
        console.log(
          `Image HIGH traitée dans son format original (${metadata.format}) avec qualité ${quality}`
        );
      }
    } else {
      // type === "low"
      // Pour low-res, on convertit en WebP si demandé (ce qui est le cas par défaut depuis photos-actions.tsx)
      if (convertToWebp) {
        sharpInstance = sharpInstance.webp({ quality: quality });
        finalMimeType = "image/webp";
        console.log(`Image LOW convertie en WebP avec qualité ${quality}`);
      } else {
        // Fallback pour low-res si pas de conversion WebP
        if (metadata.format === "jpeg") {
          sharpInstance = sharpInstance.jpeg({ quality: quality });
          finalMimeType = "image/jpeg";
        } else if (metadata.format === "png") {
          sharpInstance = sharpInstance.png({
            quality: Math.floor(quality / 10),
          });
          finalMimeType = "image/png";
        } else if (metadata.format === "webp") {
          sharpInstance = sharpInstance.webp({ quality: quality });
          finalMimeType = "image/webp";
        }
      }
    }

    try {
      await sharpInstance.toFile(processedImageFilePath);
      console.log(`Image traitée sauvegardée: ${processedImageFilePath}`);
    } catch (processingError) {
      console.error(
        "Erreur lors du traitement final de l'image avec Sharp:",
        processingError
      );
      // En cas d'erreur de traitement, on pourrait essayer de sauvegarder l'original non traité
      // ou retourner une erreur plus spécifique. Pour l'instant, on laisse l'erreur se propager.
      throw processingError;
    }

    let finalStats = await fs.stat(processedImageFilePath);
    // Logique de re-compression pour les images 'low' si elles sont trop grosses
    if (
      type === "low" &&
      finalStats.size / 1024 > 300 &&
      finalMimeType === "image/webp"
    ) {
      console.log(
        `Image LOW WebP trop volumineuse (${(finalStats.size / 1024).toFixed(2)}KB), tentative de compression supplémentaire`
      );
      try {
        let recompressSharp = sharp(processedImageFilePath); // Relire le fichier déjà traité
        recompressSharp = recompressSharp.webp({
          quality: Math.max(quality - 20, 50),
        }); // Qualité encore plus basse

        const tempRecompressedPath = processedImageFilePath + ".tmp.webp";
        await recompressSharp.toFile(tempRecompressedPath);

        const tempStats = await fs.stat(tempRecompressedPath);
        if (tempStats.size < finalStats.size) {
          await fs.rename(tempRecompressedPath, processedImageFilePath);
          finalStats = tempStats;
          console.log(
            `Compression supplémentaire WebP pour LOW effectuée, nouvelle taille: ${(finalStats.size / 1024).toFixed(2)}KB`
          );
        } else {
          await fs.unlink(tempRecompressedPath);
          console.log(
            `Compression supplémentaire WebP pour LOW n'a pas réduit la taille.`
          );
        }
      } catch (recompressError) {
        console.error(
          "Erreur lors de la recompression de l'image LOW:",
          recompressError
        );
      }
    }

    const finalImageUrl = `/${processedImageSubDir}/${processedFileName}`;

    // Récupérer les métadonnées de l'image finale (après traitement et éventuel redimensionnement)
    const finalImageMetadata = await sharp(processedImageFilePath).metadata();

    return NextResponse.json({
      success: true,
      imageUrl: finalImageUrl, // URL de l'image traitée (WebP pour 'high')
      details: {
        originalType: image.type, // Type MIME du fichier uploadé
        finalType: finalMimeType, // Type MIME du fichier sauvegardé et référencé
        width: finalImageMetadata.width || metadata.width || 0,
        height: finalImageMetadata.height || metadata.height || 0,
        size: (finalStats.size / 1024).toFixed(2) + "KB",
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
