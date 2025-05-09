import { NextResponse } from "next/server";
import { parse } from "node-html-parser";
import { Vibrant } from "node-vibrant/node";
import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";

extend([a11yPlugin]);

// Durée de mise en cache (4 heures)
const CACHE_MAX_AGE = 60 * 60 * 4;

// Votre nom d'utilisateur Letterboxd
const LETTERBOXD_USERNAME = process.env.LETTERBOXD_USERNAME || "ArnaudGct";

// Clé API TMDB (à ajouter dans votre fichier .env)
const TMDB_API_KEY = process.env.TMDB_API_KEY || "votre_clé_api_tmdb";

// Fonction pour obtenir les détails du film depuis TMDB (incluant le titre français et l'URL de l'affiche)
async function getTmdbMovieDetails(movieId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=translations`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Portfolio-Project",
        },
        next: { revalidate: CACHE_MAX_AGE },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Échec de la récupération des données TMDB: ${response.status}`
      );
    }

    const data = await response.json();

    // Par défaut, on prend le titre français provenant de la requête principale
    let frenchTitle = data.title || "";
    let posterUrl = null;

    // Si on a une image d'affiche, on crée l'URL complète
    if (data.poster_path) {
      posterUrl = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
    }

    // On peut aussi récupérer d'autres métadonnées utiles
    const summary = data.overview || "";
    const originalTitle = data.original_title || "";
    const releaseDate = data.release_date || "";

    return {
      frenchTitle,
      originalTitle,
      posterUrl,
      summary,
      releaseDate,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données TMDB:", error);
    return {
      frenchTitle: null,
      originalTitle: null,
      posterUrl: null,
      summary: null,
      releaseDate: null,
    };
  }
}

async function generateColorScheme(imageUrl) {
  try {
    // Si l'URL est null, retourner les couleurs par défaut
    if (!imageUrl) {
      throw new Error("URL d'image manquante");
    }

    // Extraire les couleurs avec Vibrant
    const palette = await Vibrant.from(imageUrl).getPalette();

    // Vibrant donne plusieurs échantillons de couleurs: Vibrant, Muted, DarkVibrant, etc.
    // Choisissons la couleur vibrante comme couleur principale
    const primarySwatch =
      palette.Vibrant || palette.DarkVibrant || palette.Muted;

    if (!primarySwatch) {
      throw new Error("Impossible d'extraire des couleurs de l'image");
    }

    // Convertir en objet colord pour plus de manipulations
    const primaryColor = colord(primarySwatch.hex);

    // Créer un schéma de couleurs harmonieux
    const bgColor = primaryColor.darken(0.6).toHex(); // Fond plus sombre pour Letterboxd

    // Générer une couleur de bordure avec un contraste approprié
    const borderColor = primaryColor.lighten(0.1).toHex();

    // Pour le texte, utiliser des couleurs qui garantissent un bon contraste
    let labelColor = primaryColor.lighten(0.2).toHex();
    let titleColor = "#FFFFFF"; // Texte blanc par défaut pour les affiches de films

    // Assurer un contraste suffisant pour l'accessibilité
    const darkBg = colord(bgColor);
    if (darkBg.contrast(colord(labelColor)) < 3) {
      labelColor = darkBg.isDark() ? "#d0d0d0" : "#404040";
    }

    return {
      bgColor,
      borderColor,
      labelColor,
      titleColor,
    };
  } catch (error) {
    console.error("Erreur lors de l'extraction des couleurs:", error);
    // Retourner des couleurs par défaut en cas d'erreur
    return {
      bgColor: "#14181c", // Fond noir comme Letterboxd
      borderColor: "#ff8000", // Orange Letterboxd
      labelColor: "#ff9a3c", // Orange plus clair
      titleColor: "#ffffff", // Texte blanc
    };
  }
}

export async function GET() {
  try {
    // Récupérer le flux RSS de votre profil Letterboxd
    const response = await fetch(
      `https://letterboxd.com/${LETTERBOXD_USERNAME}/rss/`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        next: { revalidate: CACHE_MAX_AGE },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Échec de la récupération du flux RSS Letterboxd: ${response.status}`
      );
    }

    const rssContent = await response.text();

    // Trouver tous les <item> dans le flux RSS
    const itemMatches = rssContent.match(/<item>[\s\S]*?<\/item>/g);

    if (!itemMatches || itemMatches.length === 0) {
      throw new Error("Aucun film trouvé dans le flux RSS");
    }

    // Parcourir tous les items pour trouver des films visionnés
    for (const item of itemMatches) {
      // Extraire les informations du film à partir de l'élément <item>
      const titleMatch = item.match(/<title>(.*?), (\d{4}) - (.+?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const tmdbIdMatch = item.match(/<tmdb:movieId>(\d+)<\/tmdb:movieId>/);

      // Vérifier si nous avons trouvé les informations essentielles
      if (titleMatch && linkMatch && tmdbIdMatch) {
        const englishTitle = titleMatch[1];
        const year = titleMatch[2];
        const rating = titleMatch[3];
        const filmUrl = linkMatch[1];
        const tmdbId = tmdbIdMatch[1];

        // Récupérer les détails du film depuis TMDB (titre français et affiche)
        const tmdbDetails = await getTmdbMovieDetails(tmdbId);

        // Utiliser le titre français s'il existe, sinon utiliser le titre anglais de Letterboxd
        const title = tmdbDetails.frenchTitle || englishTitle;

        // Récupérer l'URL de l'affiche
        let posterUrl = tmdbDetails.posterUrl;

        // Si TMDB ne fournit pas d'affiche, utiliser une image par défaut
        if (!posterUrl) {
          posterUrl = "/letterboxd-fallback.webp";
        }

        // Récupérer plus d'informations à partir de la page du film
        const filmPageResponse = await fetch(filmUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          next: { revalidate: CACHE_MAX_AGE },
        });

        if (!filmPageResponse.ok) {
          throw new Error(
            `Échec de la récupération de la page du film: ${filmPageResponse.status}`
          );
        }

        const filmPageHtml = await filmPageResponse.text();
        const root = parse(filmPageHtml);

        // Extraire le réalisateur (director)
        const directorElement = root.querySelector(
          'meta[name="twitter:data2"]'
        );
        const director = directorElement
          ? directorElement.getAttribute("content")
          : "Inconnu";

        // Construction d'un objet représentant la note
        let ratingValue = 0;
        if (rating.includes("★")) {
          ratingValue = rating.split("★").length - 1;
          if (rating.includes("½")) ratingValue += 0.5;
        }

        // Générer le schéma de couleurs à partir de l'affiche TMDB
        const colorScheme = await generateColorScheme(posterUrl);

        // Construire l'objet de réponse
        const filmInfo = {
          title, // Titre français
          originalTitle: englishTitle, // Conserver le titre original/anglais
          director,
          year,
          rating: ratingValue,
          posterUrl,
          letterboxdUrl: filmUrl,
          tmdbId,
          summary: tmdbDetails.summary || "", // Résumé en français
          // Inclure le schéma de couleurs
          ...colorScheme,
        };

        // Retourner les données avec en-tête de cache
        return NextResponse.json(filmInfo, {
          headers: {
            "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate`,
          },
        });
      }
    }

    throw new Error(
      "Aucun film récent avec des informations complètes n'a été trouvé"
    );
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données Letterboxd:",
      error
    );
    return NextResponse.json(
      { error: "Échec de la récupération des données", message: error.message },
      { status: 500 }
    );
  }
}
