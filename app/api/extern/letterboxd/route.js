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

// Timeout pour les requêtes
const FETCH_TIMEOUT = 3000; // 3 secondes max par requête

// Fonction helper pour créer un fetch avec timeout
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

async function generateColorScheme(imageUrl) {
  try {
    // Si l'URL est null, retourner les couleurs par défaut
    if (!imageUrl) {
      throw new Error("URL d'image manquante");
    }

    // Timeout plus court pour l'extraction des couleurs
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout couleurs")), 2000);
    });

    // Extraire les couleurs avec Vibrant avec timeout
    const palettePromise = Vibrant.from(imageUrl).getPalette();
    const palette = await Promise.race([palettePromise, timeoutPromise]);

    // Utiliser Vibrant ou DarkVibrant comme couleur principale
    const primarySwatch =
      palette.Vibrant ||
      palette.DarkVibrant ||
      palette.Muted ||
      palette.LightVibrant;

    if (!primarySwatch) {
      throw new Error("Impossible d'extraire des couleurs de l'image");
    }

    // Convertir en objet colord pour plus de manipulations
    const primaryColor = colord(primarySwatch.hex);

    // Créer un schéma de couleurs harmonieux
    const bgColor = primaryColor.toHex();
    const borderColor = primaryColor.lighten(0.15).toHex();

    // Pour le texte, utiliser les couleurs recommandées par Vibrant si disponible
    let labelColor, titleColor;

    if (primaryColor.isDark()) {
      labelColor = primarySwatch.titleTextColor || "#FFFFFF";
      titleColor = "#FFFFFF";
    } else {
      labelColor = primarySwatch.bodyTextColor || "#333333";
      titleColor = "#000000";
    }

    // Assurer un contraste suffisant pour l'accessibilité (version simplifiée)
    const labelColorObj = colord(labelColor);
    const titleColorObj = colord(titleColor);

    if (primaryColor.contrast(labelColorObj) < 3) {
      labelColor = primaryColor.isDark() ? "#e0e0e0" : "#404040";
    }

    if (primaryColor.contrast(titleColorObj) < 4.5) {
      titleColor = primaryColor.isDark() ? "#FFFFFF" : "#000000";
    }

    return {
      bgColor,
      borderColor,
      labelColor,
      titleColor,
    };
  } catch (error) {
    console.error("Erreur lors de l'extraction des couleurs:", error);
    // Retourner des couleurs par défaut rapidement
    return {
      bgColor: "#1e3a8a",
      borderColor: "#3b82f6",
      labelColor: "#e0e7ff",
      titleColor: "#ffffff",
    };
  }
}

async function getTmdbMovieDetails(id, mediaType = "movie") {
  try {
    const response = await fetchWithTimeout(
      `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${TMDB_API_KEY}&language=fr-FR`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Portfolio-Project",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Échec de la récupération des données TMDB: ${response.status}`
      );
    }

    const data = await response.json();

    // Par défaut, on prend le titre français provenant de la requête principale
    let frenchTitle = mediaType === "movie" ? data.title : data.name;
    let posterUrl = null;

    // Si on a une image d'affiche, on crée l'URL complète
    if (data.poster_path) {
      posterUrl = `https://image.tmdb.org/t/p/w185${data.poster_path}`;
    }

    const summary = data.overview || "";
    const originalTitle =
      mediaType === "movie" ? data.original_title : data.original_name;
    const releaseDate = data.release_date || data.first_air_date || "";

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

async function getDirectorFromPage(filmUrl) {
  try {
    const filmPageResponse = await fetchWithTimeout(filmUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
    });

    if (!filmPageResponse.ok) {
      throw new Error(
        `Échec de la récupération de la page du film: ${filmPageResponse.status}`
      );
    }

    const filmPageHtml = await filmPageResponse.text();
    const root = parse(filmPageHtml);

    // Extraire le réalisateur
    const directorElement = root.querySelector('meta[name="twitter:data2"]');
    return directorElement
      ? directorElement.getAttribute("content")
      : "Inconnu";
  } catch (error) {
    console.error("Erreur lors de la récupération du réalisateur:", error);
    return "Inconnu";
  }
}

export async function GET(request) {
  try {
    console.log("🎬 Début de la récupération des données Letterboxd");

    // Récupérer le flux RSS de votre profil Letterboxd
    const response = await fetchWithTimeout(
      `https://letterboxd.com/${LETTERBOXD_USERNAME}/rss/`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Échec de la récupération du flux RSS Letterboxd: ${response.status}`
      );
    }

    const rssContent = await response.text();
    console.log("✅ RSS récupéré");

    // Trouver tous les <item> dans le flux RSS
    const itemMatches = rssContent.match(/<item>[\s\S]*?<\/item>/g);

    if (!itemMatches || itemMatches.length === 0) {
      throw new Error("Aucun film trouvé dans le flux RSS");
    }

    // Tableau pour stocker tous les films avec leurs dates de publication
    const moviesWithDates = [];

    // Parcourir tous les items pour trouver des films visionnés
    for (const item of itemMatches) {
      const hasTvId = item.includes("<tmdb:tvId>");
      const hasMovieId = item.includes("<tmdb:movieId>");

      const titleMatch = item.match(/<title>(.*?), (\d{4}) - (.+?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const tmdbMovieIdMatch = item.match(
        /<tmdb:movieId>(\d+)<\/tmdb:movieId>/
      );
      const tmdbTvIdMatch = item.match(/<tmdb:tvId>(\d+)<\/tmdb:tvId>/);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      const watchedDateMatch = item.match(
        /<letterboxd:watchedDate>(.*?)<\/letterboxd:watchedDate>/
      );

      if (
        titleMatch &&
        linkMatch &&
        (tmdbMovieIdMatch || tmdbTvIdMatch) &&
        pubDateMatch &&
        watchedDateMatch
      ) {
        const englishTitle = titleMatch[1];
        const year = titleMatch[2];
        const rating = titleMatch[3];
        const filmUrl = linkMatch[1];
        const tmdbId = tmdbMovieIdMatch
          ? tmdbMovieIdMatch[1]
          : tmdbTvIdMatch[1];
        const pubDate = new Date(pubDateMatch[1]);
        const watchedDate = new Date(watchedDateMatch[1]);
        const mediaType = hasMovieId ? "movie" : "tv";

        moviesWithDates.push({
          englishTitle,
          year,
          rating,
          filmUrl,
          tmdbId,
          pubDate,
          watchedDate,
          mediaType,
        });
      }
    }

    // Trier les films par date de visionnage réelle, du plus récent au plus ancien
    moviesWithDates.sort((a, b) => b.watchedDate - a.watchedDate);

    if (moviesWithDates.length === 0) {
      throw new Error(
        "Aucun film avec des informations complètes n'a été trouvé"
      );
    }

    // Prendre le film le plus récent
    const latestMovie = moviesWithDates[0];
    console.log("🎯 Film le plus récent:", latestMovie.englishTitle);

    // **OPTIMISATION CLÉE : Exécuter les requêtes en parallèle**
    console.log("🚀 Lancement des requêtes parallèles...");

    const [tmdbDetails, director] = await Promise.allSettled([
      getTmdbMovieDetails(latestMovie.tmdbId, latestMovie.mediaType),
      getDirectorFromPage(latestMovie.filmUrl),
    ]);

    // Récupérer les résultats ou utiliser des valeurs par défaut
    const tmdbData =
      tmdbDetails.status === "fulfilled"
        ? tmdbDetails.value
        : {
            frenchTitle: null,
            originalTitle: null,
            posterUrl: null,
            summary: null,
            releaseDate: null,
          };

    const directorName =
      director.status === "fulfilled" ? director.value : "Inconnu";

    console.log("✅ Données TMDB et réalisateur récupérées");

    // Utiliser le titre français s'il existe, sinon utiliser le titre anglais de Letterboxd
    const title = tmdbData.frenchTitle || latestMovie.englishTitle;

    // Récupérer l'URL de l'affiche
    let posterUrl = tmdbData.posterUrl;
    if (!posterUrl) {
      posterUrl = "/letterboxd-fallback.webp";
    }

    // Construction d'un objet représentant la note
    let ratingValue = 0;
    if (latestMovie.rating.includes("★")) {
      ratingValue = latestMovie.rating.split("★").length - 1;
      if (latestMovie.rating.includes("½")) ratingValue += 0.5;
    }

    // Générer le schéma de couleurs en arrière-plan (non bloquant)
    console.log("🎨 Génération des couleurs...");
    const colorScheme = await generateColorScheme(posterUrl);
    console.log("✅ Couleurs générées");

    // Construire l'objet de réponse
    const filmInfo = {
      title,
      originalTitle: latestMovie.englishTitle,
      director: directorName,
      year: latestMovie.year,
      rating: ratingValue,
      posterUrl,
      letterboxdUrl: latestMovie.filmUrl,
      tmdbId: latestMovie.tmdbId,
      mediaType: latestMovie.mediaType,
      summary: tmdbData.summary || "",
      watchedDate: latestMovie.watchedDate.toISOString(),
      ...colorScheme,
    };

    console.log("✅ Données complètes récupérées en", Date.now());

    // Retourner les données avec en-tête de cache optimisé
    return NextResponse.json(filmInfo, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60", // 5 min de cache
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des données Letterboxd:",
      error
    );
    return NextResponse.json(
      { error: "Échec de la récupération des données", message: error.message },
      { status: 500 }
    );
  }
}
