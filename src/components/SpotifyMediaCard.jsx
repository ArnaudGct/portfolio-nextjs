"use client";
import { useEffect, useState, useRef } from "react";
import MediaCard from "./MediaCard";
import { progressAt, syncProgress } from "../../lib/spotify/progress.mjs";
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
  receivedAt,
  duration,
  isPlaying,
  bgColor,
  borderColor,
  labelColor,
}) => {
  const clock = useRef(null);
  const [currentProgress, setCurrentProgress] = useState(progress);

  useEffect(() => {
    const now = performance.now();
    // Tenir compte du temps écoulé depuis la réception, même après un remount.
    const elapsed = isPlaying ? Math.max(0, now - receivedAt) : 0;
    clock.current = syncProgress(clock.current, {
      progress: progress + elapsed, duration, isPlaying,
    }, now);
    setCurrentProgress(progressAt(clock.current, now));
  }, [progress, receivedAt, duration, isPlaying]);

  useEffect(() => {
    let frame;
    let lastPaint = 0;
    const tick = (now) => {
      if (clock.current && now - lastPaint >= 50) {
        setCurrentProgress(progressAt(clock.current, now));
        lastPaint = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

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
      <div role="progressbar" aria-label="Progression du morceau" aria-valuemin={0} aria-valuemax={Math.floor(duration / 1000)} aria-valuenow={Math.floor(currentProgress / 1000)} className="relative h-1 bg-black/20 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-75 ease-linear motion-reduce:transition-none"
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
  useEffect(() => {
    let disposed = false;
    let timer;
    let controller;

    const refresh = async () => {
      let delay = 30000;
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch("/api/extern/spotify", {
          cache: "no-store", signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (disposed) return;
        if (response.status === 404) {
          setTrackData(null);
          setError(null);
        } else {
          if (!response.ok || !data) throw new Error(data?.message || data?.error || "Spotify indisponible");
          setTrackData({ ...data, receivedAt: performance.now() });
          setError(null);
          delay = data.isCurrentlyPlaying ? 5000 : 30000;
        }
      } catch (err) {
        if (!disposed) setError(err.message);
      } finally {
        clearTimeout(timeout);
        if (!disposed) {
          setIsLoading(false);
          // Une seule requête à la fois, y compris si Spotify répond lentement.
          timer = setTimeout(refresh, delay);
        }
      }
    };
    refresh();
    return () => {
      disposed = true;
      clearTimeout(timer);
      controller?.abort();
    };
  }, []);

  // Déterminer la hauteur selon l'état de lecture
  const cardHeight = trackData?.isCurrentlyPlaying ? "h-32" : "h-24";

  if (isLoading && !trackData) {
    return (
      <div className={cardHeight}>
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
    const errorSubtitle = error.includes("Refresh token Spotify révoqué")
      ? "Authentification Spotify à régénérer"
      : error;

    return (
      <div className={cardHeight}>
        <MediaCard
          imageComponent={<ErrorPlaceholder />}
          imageType="custom"
          labelText="Indisponible"
          titleText="Spotify"
          subtitleText={errorSubtitle}
          {...ERROR_COLORS}
          logoSrc="/spotify.webp"
          logoAlt="Logo de Spotify"
        />
      </div>
    );
  }

  if (!trackData) {
    return (
      <div className={cardHeight}>
        <MediaCard
          imageComponent={<ErrorPlaceholder />}
          imageType="custom"
          labelText="Indisponible"
          titleText="Spotify"
          subtitleText="Aucun morceau disponible"
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
    <div className={cardHeight}>
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
              key={trackData.spotifyUrl || trackData.title}
              receivedAt={trackData.receivedAt}
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
