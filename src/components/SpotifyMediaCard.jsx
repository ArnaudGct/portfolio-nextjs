"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import MediaCard from "./MediaCard";
import NumberFlow from "@number-flow/react";
// Import des icônes Lucide nécessaires
import { AlertCircle, Loader2, Play, Pause } from "lucide-react";

// Couleurs par défaut pour le contenu réel
const DEFAULT_COLORS = {
  bgColor: "#a52a1a",
  borderColor: "#ff6a6a",
  labelColor: "#ffa2a2",
  titleColor: "#FFEDED",
};

// Couleurs pour le skeleton de chargement (version grisée des couleurs Spotify)
const SKELETON_COLORS = {
  bgColor: "#212121",
  borderColor: "#303030",
  labelColor: "#909090",
  titleColor: "#b3b3b3",
};

// Couleurs pour l'état d'erreur (version rouge grisée)
const ERROR_COLORS = {
  bgColor: "#3D1D1D",
  borderColor: "#5A2828",
  labelColor: "#9E7575",
  titleColor: "#C5A4A4",
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

// Composant de barre de progression
const ProgressBar = ({
  progress,
  duration,
  isPlaying,
  bgColor,
  borderColor,
  labelColor,
}) => {
  const [currentProgress, setCurrentProgress] = useState(progress);

  useEffect(() => {
    setCurrentProgress(progress);
  }, [progress]);

  // Mise à jour en temps réel quand la musique est en cours de lecture
  useEffect(() => {
    if (!isPlaying || !duration) return;

    const interval = setInterval(() => {
      setCurrentProgress((prev) => {
        const newProgress = prev + 1000; // +1 seconde
        return newProgress >= duration ? duration : newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return { minutes, seconds };
  };

  const progressPercentage = duration ? (currentProgress / duration) * 100 : 0;
  const currentTime = formatTime(currentProgress);
  const totalTime = formatTime(duration);

  return (
    <div className="mt-2 space-y-1">
      {/* Barre de progression unique */}
      <div className="relative h-1 bg-black/20 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: borderColor,
            boxShadow: isPlaying ? `0 0 6px ${borderColor}60` : "none",
          }}
        />
      </div>

      {/* Temps et icône de lecture */}
      <div
        className="flex items-center justify-between text-xs"
        style={{ color: labelColor }}
      >
        <div className="flex items-center space-x-2">
          {isPlaying ? (
            <Play className="w-3 h-3 fill-current" />
          ) : (
            <Pause className="w-3 h-3" />
          )}
          <span>
            <NumberFlow
              value={currentTime.minutes}
              format={{ minimumIntegerDigits: 1 }}
            />
            :
            <NumberFlow
              value={currentTime.seconds}
              format={{ minimumIntegerDigits: 2 }}
            />
          </span>
        </div>
        <span>
          <NumberFlow
            value={totalTime.minutes}
            format={{ minimumIntegerDigits: 1 }}
          />
          :
          <NumberFlow
            value={totalTime.seconds}
            format={{ minimumIntegerDigits: 2 }}
          />
        </span>
      </div>
    </div>
  );
};

export default function SpotifyMediaCard() {
  const [trackData, setTrackData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);
  const isInitialLoad = useRef(true);
  const lastTrackId = useRef(null);
  const timeoutRef = useRef(null);
  const hoverTimeoutRef = useRef(null); // Nouveau ref pour le hover

  const fetchTopTrack = useCallback(async () => {
    // Empêcher le rafraîchissement si on est en hover
    if (isHovered) {
      return;
    }

    try {
      // Ne pas réafficher le loading si on a déjà des données
      if (isInitialLoad.current) {
        setIsLoading(true);
      }

      const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const response = await fetch(`/api/extern/spotify?bust=${uniqueId}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!response.ok) {
        throw new Error("Échec de la récupération des données Spotify");
      }

      const data = await response.json();

      // Vérifier si c'est une nouvelle musique
      const currentTrackId = data.spotifyUrl || data.title;
      const isNewTrack = lastTrackId.current !== currentTrackId;

      if (isNewTrack) {
        console.log("Nouvelle musique détectée:", data.title);
        lastTrackId.current = currentTrackId;
      }

      setTrackData(data);
      setError(null);
      isInitialLoad.current = false;
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
    } finally {
      if (isInitialLoad.current) {
        setIsLoading(false);
      }
    }
  }, [isHovered]); // Ajouter isHovered comme dépendance

  useEffect(() => {
    // Récupération initiale
    fetchTopTrack();
  }, [fetchTopTrack]);

  // Effet pour gérer les intervalles selon l'état de lecture et le hover
  useEffect(() => {
    // Nettoyer l'intervalle précédent
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Si on n'a pas de données ou si on est en hover, ne pas démarrer d'intervalle
    if (!trackData || isHovered) return;

    // Déterminer l'intervalle selon l'état de lecture
    const interval = trackData.isCurrentlyPlaying ? 5 * 1000 : 30 * 1000; // 5 secondes si en cours, 30 secondes sinon

    intervalRef.current = setInterval(() => {
      fetchTopTrack();
    }, interval);

    // Nettoyage
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [trackData?.isCurrentlyPlaying, fetchTopTrack, isHovered]);

  // Gestionnaires d'événements pour le hover
  const handleMouseEnter = () => {
    // Annuler tout timeout de sortie en cours
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // Petit délai pour éviter les flickering rapides
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 1000); // Délai très court juste pour éviter les flickering
  };

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading && !trackData) {
    return (
      <div className="h-32">
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

  if (error && !trackData) {
    console.error("Erreur:", error);
    return (
      <div className="h-32">
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

  if (!trackData) {
    return (
      <div className="h-32">
        <MediaCard
          imageComponent={<ErrorPlaceholder />}
          imageType="custom"
          labelText="Indisponible"
          titleText="Spotify"
          subtitleText="Aucune donnée"
          {...ERROR_COLORS}
          logoSrc="/spotify.webp"
          logoAlt="Logo de Spotify"
        />
      </div>
    );
  }

  const {
    bgColor = DEFAULT_COLORS.bgColor,
    borderColor = DEFAULT_COLORS.borderColor,
    labelColor = DEFAULT_COLORS.labelColor,
    titleColor = DEFAULT_COLORS.titleColor,
  } = trackData;

  const labelText = trackData.isCurrentlyPlaying
    ? "Ce que j'écoute actuellement"
    : trackData.isMostPlayed
      ? "Mon son le plus écouté du mois"
      : "Le dernier son que j'ai écouté";

  return (
    <div
      className="h-32"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
        additionalContent={
          trackData.isCurrentlyPlaying &&
          trackData.progress !== undefined && (
            <ProgressBar
              progress={trackData.progress}
              duration={trackData.duration}
              isPlaying={trackData.isCurrentlyPlaying}
              bgColor={bgColor}
              borderColor={borderColor}
              labelColor={labelColor}
            />
          )
        }
      />
    </div>
  );
}
