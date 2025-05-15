"use client";
import { useEffect, useState } from "react";
import MediaCard from "./MediaCard";
// Import des icônes Lucide nécessaires
import { AlertCircle, Loader2 } from "lucide-react";

// Couleurs par défaut pour le contenu réel
const DEFAULT_COLORS = {
  bgColor: "#a52a1a",
  borderColor: "#ff6a6a",
  labelColor: "#ffa2a2",
  titleColor: "#FFEDED",
};

// Couleurs pour le skeleton de chargement (version grisée des couleurs Spotify)
const SKELETON_COLORS = {
  bgColor: "#212121", // Gris foncé pour le fond
  borderColor: "#303030", // Gris légèrement plus clair pour la bordure
  labelColor: "#909090", // Gris moyen pour le texte secondaire
  titleColor: "#b3b3b3", // Gris clair pour le texte principal (couleur de texte Spotify)
};

// Couleurs pour l'état d'erreur (version rouge grisée)
const ERROR_COLORS = {
  bgColor: "#3D1D1D", // Rouge très foncé et grisé
  borderColor: "#5A2828", // Rouge foncé grisé
  labelColor: "#9E7575", // Rouge moyen grisé
  titleColor: "#C5A4A4", // Rouge clair grisé
};

// Composant de spinner qui tourne pour le chargement avec Lucide
const SpinnerLoader = () => (
  <div className="w-full h-full bg-[#333333] flex items-center justify-center">
    <div className="relative flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" />
    </div>
  </div>
);

// Composant placeholder d'erreur avec Lucide
const ErrorPlaceholder = () => (
  <div className="w-full h-full bg-[#333333] flex items-center justify-center">
    <AlertCircle className="w-8 h-8 text-[#9E7575]" />
  </div>
);

export default function SpotifyMediaCard() {
  const [trackData, setTrackData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTopTrack() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/extern/spotify");

        if (!response.ok) {
          throw new Error("Échec de la récupération des données Spotify");
        }

        const data = await response.json();
        setTrackData(data);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopTrack();
  }, []);

  if (isLoading) {
    return (
      <div className="h-24">
        <MediaCard
          imageComponent={<SpinnerLoader />}
          imageType="custom"
          labelText="Chargement..."
          titleText="En cours..."
          subtitleText="Spotify"
          {...SKELETON_COLORS}
          logoSrc="/spotify.webp"
          logoAlt="Logo de Spotify"
        />
      </div>
    );
  }

  if (error || !trackData) {
    console.error("Erreur:", error);
    return (
      <div className="h-24">
        <MediaCard
          imageComponent={<ErrorPlaceholder />}
          imageType="custom"
          labelText="Indisponible"
          titleText="Spotify"
          subtitleText="Erreur de connexion"
          {...ERROR_COLORS}
          logoSrc="/spotify.webp"
          logoAlt="Logo de Spotify"
        />
      </div>
    );
  }

  // Extraire les couleurs du trackData ou utiliser les couleurs par défaut
  const {
    bgColor = DEFAULT_COLORS.bgColor,
    borderColor = DEFAULT_COLORS.borderColor,
    labelColor = DEFAULT_COLORS.labelColor,
    titleColor = DEFAULT_COLORS.titleColor,
  } = trackData;

  const labelText = trackData.isCurrentlyPlaying
    ? "Écoute en cours"
    : trackData.isMostPlayed
      ? "Le plus écouté du mois"
      : "Dernier son écouté";

  return (
    <div className="h-24">
      <MediaCard
        imageSrc={trackData.albumImageUrl}
        imageAlt={`Pochette de l'album ${trackData.albumName}`}
        imageType="cover"
        labelText={labelText}
        titleText={trackData.title}
        subtitleText={trackData.artist}
        bgColor={bgColor}
        borderColor={borderColor}
        labelColor={labelColor}
        titleColor={titleColor}
        logoSrc="/spotify.webp"
        logoAlt="Logo de Spotify"
        link={trackData.spotifyUrl}
        newTab={true}
      />
    </div>
  );
}
