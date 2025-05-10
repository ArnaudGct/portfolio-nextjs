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

async function generateColorScheme(imageUrl) {
  try {
    // Si l'URL est null, retourner les couleurs par défaut
    if (!imageUrl) {
      throw new Error("URL d'image manquante");
    }

    // Extraire les couleurs avec Vibrant
    const palette = await Vibrant.from(imageUrl).getPalette();

    // Utiliser Vibrant ou DarkVibrant comme couleur principale, comme dans l'API Spotify
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

    // Créer un schéma de couleurs harmonieux - utiliser la couleur directement comme dans Spotify
    // au lieu de la rendre plus foncée
    const bgColor = primaryColor.toHex();

    // Générer une couleur de bordure plus claire pour un bon contraste
    const borderColor = primaryColor.lighten(0.15).toHex();

    // Pour le texte, utiliser des couleurs qui garantissent un bon contraste
    let labelColor, titleColor;

    if (primaryColor.isDark()) {
      // Fond sombre: utiliser des textes clairs
      labelColor = colord(primarySwatch.titleTextColor || "#FFFFFF").toHex();
      titleColor = "#FFFFFF";
    } else {
      // Fond clair: utiliser des textes foncés
      labelColor = colord(primarySwatch.bodyTextColor || "#333333").toHex();
      titleColor = "#000000";
    }

    // Assurer un contraste suffisant pour l'accessibilité
    if (primaryColor.contrast(colord(labelColor)) < 3) {
      labelColor = primaryColor.isDark() ? "#d0d0d0" : "#404040";
    }

    if (primaryColor.contrast(colord(titleColor)) < 4.5) {
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
    // Retourner des couleurs par défaut en cas d'erreur
    // Couleurs plus vives et attrayantes
    return {
      bgColor: "#1e3a8a", // Bleu foncé mais pas noir
      borderColor: "#3b82f6", // Bleu plus clair pour la bordure
      labelColor: "#93c5fd", // Bleu clair pour les étiquettes
      titleColor: "#ffffff", // Blanc pour le texte principal
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
        cache: "no-store", // Force un rechargement pour obtenir les données les plus récentes
      }
    );

    if (!response.ok) {
      throw new Error(
        `Échec de la récupération du flux RSS Letterboxd: ${response.status}`
      );
    }

    const rssContent = await response.text();
    console.log("RSS Content:", rssContent.substring(0, 500)); // Pour le débogage

    // Trouver tous les <item> dans le flux RSS
    const itemMatches = rssContent.match(/<item>[\s\S]*?<\/item>/g);

    if (!itemMatches || itemMatches.length === 0) {
      throw new Error("Aucun film trouvé dans le flux RSS");
    }

    // Tableau pour stocker tous les films avec leurs dates de publication
    const moviesWithDates = [];

    // Parcourir tous les items pour trouver des films visionnés
    for (const item of itemMatches) {
      // Différencier les types de films (séries TV vs films)
      const hasTvId = item.includes("<tmdb:tvId>");
      const hasMovieId = item.includes("<tmdb:movieId>");

      // Extraire les informations du film à partir de l'élément <item>
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

      // Vérifier si nous avons trouvé les informations essentielles
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
        const pubDate = new Date(pubDateMatch[1]); // Date de publication dans le flux
        const watchedDate = new Date(watchedDateMatch[1]); // Date réelle de visionnage

        // Type de média (film ou série TV)
        const mediaType = hasMovieId ? "movie" : "tv";

        // Ajouter au tableau avec toutes les dates
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

    // Si aucun film n'est trouvé après filtrage
    if (moviesWithDates.length === 0) {
      throw new Error(
        "Aucun film avec des informations complètes n'a été trouvé"
      );
    }

    // Afficher les films trouvés pour le débogage
    console.log(
      "Films trouvés:",
      moviesWithDates
        .map((m) => `${m.englishTitle} (${m.watchedDate.toISOString()})`)
        .join(", ")
    );

    // Prendre le film le plus récent
    const latestMovie = moviesWithDates[0];
    console.log("Film le plus récent:", latestMovie.englishTitle);

    // Récupérer les détails du film depuis TMDB
    const tmdbDetails = await getTmdbMovieDetails(
      latestMovie.tmdbId,
      latestMovie.mediaType
    );

    // Utiliser le titre français s'il existe, sinon utiliser le titre anglais de Letterboxd
    const title = tmdbDetails.frenchTitle || latestMovie.englishTitle;

    // Récupérer l'URL de l'affiche
    let posterUrl = tmdbDetails.posterUrl;

    // Si TMDB ne fournit pas d'affiche, utiliser une image par défaut
    if (!posterUrl) {
      posterUrl = "/letterboxd-fallback.webp";
    }
    // Récupérer plus d'informations à partir de la page du film
    const filmPageResponse = await fetch(latestMovie.filmUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store", // Force le rechargement de la page
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
    const director = directorElement
      ? directorElement.getAttribute("content")
      : "Inconnu";

    // Construction d'un objet représentant la note
    let ratingValue = 0;
    if (latestMovie.rating.includes("★")) {
      ratingValue = latestMovie.rating.split("★").length - 1;
      if (latestMovie.rating.includes("½")) ratingValue += 0.5;
    }

    // Générer le schéma de couleurs à partir de l'affiche TMDB
    const colorScheme = await generateColorScheme(posterUrl);

    // Construire l'objet de réponse
    const filmInfo = {
      title, // Titre français
      originalTitle: latestMovie.englishTitle, // Conserver le titre original/anglais
      director,
      year: latestMovie.year,
      rating: ratingValue,
      posterUrl,
      letterboxdUrl: latestMovie.filmUrl,
      tmdbId: latestMovie.tmdbId,
      mediaType: latestMovie.mediaType, // Ajout du type (film ou série TV)
      summary: tmdbDetails.summary || "", // Résumé en français
      watchedDate: latestMovie.watchedDate.toISOString(), // Date de visionnage réelle
      // Inclure le schéma de couleurs
      ...colorScheme,
    };

    // Retourner les données avec en-tête de cache court (5 min)
    return NextResponse.json(filmInfo, {
      headers: {
        "Cache-Control": `public, s-maxage=300, stale-while-revalidate`,
      },
    });
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

async function getTmdbMovieDetails(id, mediaType = "movie") {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=translations`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Portfolio-Project",
        },
        cache: "no-store", // Forcer la récupération de données fraîches
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
    // On utilise "w185" au lieu de "w500" pour une résolution plus petite et adaptée
    if (data.poster_path) {
      posterUrl = `https://image.tmdb.org/t/p/w185${data.poster_path}`;
    }

    // On peut aussi récupérer d'autres métadonnées utiles
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
