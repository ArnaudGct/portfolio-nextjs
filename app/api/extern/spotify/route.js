import { NextResponse } from "next/server";
import { Vibrant } from "node-vibrant/node";
import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";

extend([a11yPlugin]);

// Informations d'authentification Spotify (à stocker dans .env)
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

// Durée de mise en cache (4 heures)
const CACHE_MAX_AGE = 60 * 60 * 4;

// Fonction pour obtenir un token d'accès
async function getAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
      // Spécifier explicitement les scopes requis
      scope:
        "user-read-currently-playing user-read-recently-played user-top-read",
    }).toString(),
    cache: "no-cache",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Erreur d'authentification Spotify: ${JSON.stringify(error)}`
    );
  }

  const data = await response.json();
  return data.access_token;
}

async function generateColorScheme(imageUrl) {
  try {
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
    const bgColor = primaryColor.toHex();

    // Générer une couleur de bordure avec un contraste approprié
    const borderColor = primaryColor.lighten(0.15).toHex();

    // Pour le texte, utiliser des couleurs qui garantissent un bon contraste
    let labelColor, titleColor;

    if (primaryColor.isDark()) {
      // Fond sombre: utiliser des textes clairs
      labelColor = colord(primarySwatch.titleTextColor).toHex();
      titleColor = "#FFFFFF";
    } else {
      // Fond clair: utiliser des textes foncés
      labelColor = colord(primarySwatch.bodyTextColor).toHex();
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
    return {
      bgColor: "#a52a1a",
      borderColor: "#ff6a6a",
      labelColor: "#ffa2a2",
      titleColor: "#FFEDED",
    };
  }
}

export async function GET(request) {
  try {
    const accessToken = await getAccessToken();

    // Variables pour stocker les différentes sources d'information
    let currentTrack = null; // Morceau en cours de lecture
    let topTrack = null; // Morceau le plus écouté du mois
    let recentTrack = null; // Dernier morceau écouté

    let isCurrentlyPlaying = false;

    // 1. Récupérer le morceau actuellement en cours de lecture (priorité maximum)
    let response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Si un morceau est dans le lecteur (en lecture ou en pause)
    if (response.status === 200) {
      const data = await response.json();
      currentTrack = data.item;

      // Vérifier si le morceau est réellement en cours de lecture
      isCurrentlyPlaying = data.is_playing && data.item;
    }

    // 2. Récupérer le morceau le plus écouté des 4 dernières semaines (toujours)
    response = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=1",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        topTrack = data.items[0];
      }
    } else {
      console.warn(`Erreur API Spotify (top-tracks): ${response.statusText}`);
    }

    // 3. En dernier recours, récupérer le dernier morceau joué
    if (!currentTrack && !topTrack) {
      response = await fetch(
        "https://api.spotify.com/v1/me/player/recently-played?limit=1",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          recentTrack = data.items[0].track;
        }
      } else if (!currentTrack && !topTrack) {
        throw new Error(
          `Échec de récupération des données Spotify pour tous les endpoints`
        );
      }
    }

    // Logique de priorité pour sélectionner le morceau à afficher
    let track = null;
    let isMostPlayed = false;

    // Préférer le morceau en cours de lecture (en lecture uniquement) si disponible
    if (isCurrentlyPlaying) {
      track = currentTrack;
    }
    // Sinon, choisir le morceau le plus écouté du mois
    else if (topTrack) {
      track = topTrack;
      isMostPlayed = true;
    }
    // Sinon, utiliser le morceau en pause dans le lecteur
    else if (currentTrack) {
      track = currentTrack;
    }
    // En dernier recours, utiliser le dernier morceau joué
    else {
      track = recentTrack;
    }

    if (!track) {
      return NextResponse.json(
        { error: "Aucun morceau disponible" },
        { status: 404 }
      );
    }

    const albumImageUrl = track.album.images[0].url;

    // Générer le schéma de couleurs basé sur la pochette d'album
    const colorScheme = await generateColorScheme(albumImageUrl);

    // Construire l'objet de réponse avec les informations de la piste et le schéma de couleurs
    const trackInfo = {
      title: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      albumName: track.album.name,
      albumImageUrl,
      spotifyUrl: track.external_urls.spotify,
      isCurrentlyPlaying,
      isMostPlayed,
      // Ajouter le schéma de couleurs
      ...colorScheme,
    };

    // Retourner les données avec headers anti-cache pour mobile
    return NextResponse.json(trackInfo, {
      headers: {
        // Cache court avec revalidation forcée
        "Cache-Control":
          "public, s-maxage=60, stale-while-revalidate=30, must-revalidate",
        // Headers anti-cache pour mobile
        Pragma: "no-cache",
        Expires: "0",
        // Vary sur User-Agent pour différencier mobile/desktop
        Vary: "User-Agent",
        // ETag unique pour forcer la revalidation
        ETag: `"${Date.now()}"`,
        "Last-Modified": new Date().toUTCString(),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données Spotify:", error);
    return NextResponse.json(
      { error: "Échec de la récupération des données", message: error.message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}
