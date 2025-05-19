"use client";
import { useEffect, useRef, useState } from "react";
import Toggl from "./Toggl";
import { Play, Pause, Loader2, RefreshCw } from "lucide-react";

export default function CloudflarePlayer() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [showPoster, setShowPoster] = useState(true);

  // URL sans cache-busting pour éviter les rechargements complets
  const videoUrl =
    "https://pub-3a398e3ba4054303b331ad4a0434b478.r2.dev/showreel-site.mp4";
  const thumbnailUrl = "/uploads/showreel-thumbnail.webp";

  useEffect(() => {
    let isMounted = true;
    const video = videoRef.current;
    if (!video) return;

    console.log("Initialisation de la vidéo...");

    // Gestionnaires d'événements vidéo
    const handlePlaying = () => {
      console.log("Vidéo en lecture");
      if (isMounted) {
        setIsPlaying(true);
        setIsLoading(false);
        setShowPoster(false); // Masquer le poster lors de la lecture
      }
    };

    const handlePause = () => {
      console.log("Vidéo en pause");
      if (isMounted) {
        setIsPlaying(false);
      }
    };

    const handleWaiting = () => {
      console.log("Vidéo en attente/chargement");
      if (isMounted) {
        setIsLoading(true);
      }
    };

    const handleCanPlayThrough = () => {
      console.log("Vidéo peut être lue entièrement");
      if (isMounted) {
        setPlayerReady(true);
        setIsLoading(false);
      }
    };

    const handleLoadedData = () => {
      console.log("Vidéo chargée et prête");
      if (isMounted) {
        setPlayerReady(true);
        setIsLoading(false);

        // Lecture automatique si autorisée par le navigateur
        video
          .play()
          .then(() => {
            console.log("Lecture initiale réussie");
            if (isMounted) {
              setShowPoster(false);
            }
          })
          .catch((err) => console.log("Erreur de lecture initiale:", err));
      }
    };

    const handleError = (e) => {
      console.error("Erreur vidéo:", e, video.error);
      if (isMounted) {
        setLoadError(true);
        setIsLoading(false);
      }
    };

    // Ajout des écouteurs d'événements
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);

    // Force le chargement
    video.load();

    // Essai de lecture différé pour contourner les restrictions des navigateurs
    const playTimeout = setTimeout(() => {
      if (isMounted && !isPlaying && playerReady) {
        console.log("Tentative de lecture forcée");
        video.play().catch(() => {});
      }
    }, 1000);

    // Nettoyage
    return () => {
      isMounted = false;
      clearTimeout(playTimeout);

      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
    };
  }, [isPlaying, playerReady]);

  const togglePlay = () => {
    if (!videoRef.current || !playerReady) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      // Si l'utilisateur clique sur lecture, cacher le poster et jouer
      setShowPoster(false);
      videoRef.current.play().catch((err) => {
        console.error("Erreur lors de la lecture:", err);
        setLoadError(true);
      });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current || !playerReady) return;

    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const retryLoading = () => {
    setLoadError(false);
    setIsLoading(true);

    if (videoRef.current) {
      // Forcer le rechargement avec un nouveau timestamp
      videoRef.current.src = videoUrl + "?retry=" + Date.now();
      videoRef.current.load();

      videoRef.current.addEventListener(
        "loadedmetadata",
        () => {
          videoRef.current
            .play()
            .then(() => {
              setShowPoster(false);
            })
            .catch((err) => console.error("Erreur de reprise:", err));
        },
        { once: true }
      );
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background flouté pendant le chargement ou quand on montre le poster */}
      <div
        className="absolute inset-0 z-1"
        style={{
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
          opacity: playerReady && !showPoster ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
        }}
      />

      {/* Affichage du spinner de chargement */}
      {isLoading && !playerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-900/50 z-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-white animate-spin" />
            <p className="text-white font-medium">Chargement de la vidéo...</p>
            {loadError && (
              <button
                onClick={retryLoading}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Réessayer</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contrôles custom */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-row items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer">
          <button
            onClick={togglePlay}
            className="text-slate-300"
            disabled={isLoading || loadError || !playerReady}
          >
            {isPlaying ? (
              <Play strokeWidth={1.75} />
            ) : (
              <Pause strokeWidth={1.75} />
            )}
          </button>
          <p
            className="text-slate-300 text-sm font-normal font-rethink-sans"
            onClick={togglePlay}
          >
            {isPlaying ? "Lecture" : "Pause"}
          </p>
        </div>
        <div className="flex items-center gap-1 cursor-pointer">
          <Toggl
            isChecked={muted}
            setIsChecked={toggleMute}
            disabled={isLoading || loadError || !playerReady}
          />
          <p
            className="text-slate-300 text-sm font-normal font-rethink-sans"
            onClick={toggleMute}
          >
            {muted ? "Activer le son" : "Couper le son"}
          </p>
        </div>
      </div>

      {/* Gradient de surcouche */}
      <div className="absolute z-9 left-0 bottom-0 w-full h-full bg-gradient-to-tr from-blue-700 from-0% via-blue-300/0 via-15% to-transparent to-100% opacity-50 pointer-events-none" />

      {/* Vidéo HTML */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={thumbnailUrl}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        style={{
          opacity: playerReady && !showPoster ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Votre navigateur ne prend pas en charge la lecture vidéo.
      </video>
    </div>
  );
}
