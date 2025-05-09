"use client";
import { useEffect, useRef, useState } from "react";
import Toggl from "./Toggl";
import { Play, Pause, Loader2 } from "lucide-react";

export default function DailymotionPlayer() {
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const scriptLoadAttempts = useRef(0);
  const videoId = "k64y7uhzsITk5IzREtu";
  const thumbnailUrl = `https://www.dailymotion.com/thumbnail/video/${videoId}`;

  // Gérer le script Dailymotion avec une approche plus robuste
  useEffect(() => {
    let isMounted = true;
    const maxAttempts = 3;

    function loadDailymotionScript() {
      return new Promise((resolve, reject) => {
        if (typeof window === "undefined") return reject("Window not defined");

        // Vérifier si le script est déjà chargé
        if (typeof window.dailymotion !== "undefined") {
          return resolve(window.dailymotion);
        }

        const script = document.createElement("script");
        script.id = "dailymotionScript";
        script.src = "https://geo.dailymotion.com/libs/player/xkmhv.js";
        script.async = true;

        script.onload = () => resolve(window.dailymotion);
        script.onerror = (e) => reject(e);

        document.body.appendChild(script);
      });
    }

    async function initializePlayer() {
      try {
        setIsLoading(true);
        setLoadError(false);
        setPlayerReady(false);

        if (scriptLoadAttempts.current >= maxAttempts) {
          setLoadError(true);
          setIsLoading(false);
          return;
        }

        scriptLoadAttempts.current += 1;

        const dailymotionAPI = await loadDailymotionScript();

        // Attendre que le conteneur DOM soit disponible
        if (!playerRef.current) {
          setTimeout(initializePlayer, 200);
          return;
        }

        const playerInstance = await dailymotionAPI.createPlayer(
          "my-dailymotion-player",
          {
            video: "k64y7uhzsITk5IzREtu",
            params: {
              loop: "true",
              scaleMode: "fill",
              mute: "true",
              "ui-start-screen-info": false,
              "ui-logo": false,
              controls: false,
              autoplay: true,
            },
          }
        );

        if (isMounted) {
          setPlayer(playerInstance);

          // Attendre un peu plus longtemps avant de masquer le loader
          playerInstance.on("playback_ready", () => {
            if (isMounted) {
              // On attend que la vidéo soit vraiment prête à être affichée
              setTimeout(() => {
                setIsLoading(false);
                setPlayerReady(true);
              }, 500);
            }
          });

          playerInstance.on("playing", () => {
            if (isMounted) setIsPlaying(true);
          });

          playerInstance.on("pause", () => {
            if (isMounted) setIsPlaying(false);
          });

          // Gérer le défilement
          const handleScroll = () => {
            if (window.scrollY <= 10) {
              playerInstance.play();
            } else {
              playerInstance.pause();
            }
          };

          window.addEventListener("scroll", handleScroll);
          return () => window.removeEventListener("scroll", handleScroll);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement du lecteur Dailymotion:",
          error
        );
        if (isMounted) {
          setTimeout(initializePlayer, 1500);
        }
      }
    }

    // Commencer l'initialisation du lecteur
    initializePlayer();

    return () => {
      isMounted = false;
    };
  }, []);

  // Toggle Mute
  const toggleMute = () => {
    if (player) {
      if (muted) {
        player.setMute(false);
      } else {
        player.setMute(true);
      }
      setMuted(!muted);
    }
  };

  // Fonction pour démarrer ou mettre en pause la vidéo
  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
  };

  // Fonction pour retenter le chargement si erreur
  const retryLoading = () => {
    scriptLoadAttempts.current = 0;
    setLoadError(false);

    // Supprimer l'ancien script pour un chargement propre
    const existingScript = document.getElementById("dailymotionScript");
    if (existingScript) existingScript.remove();

    // Réinitialiser le lecteur
    setPlayer(null);

    // Déclencher un nouveau chargement
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && window.dailymotion) {
        createPlayer();
      } else {
        window.location.reload();
      }
    }, 500);

    return () => clearTimeout(timer);
  };

  return (
    <div className="relative w-full h-full">
      {/* Background thumbnail - reste visible jusqu'à ce que le lecteur soit complètement prêt */}
      <div
        className="absolute inset-0 z-1"
        style={{
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
          opacity: playerReady ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
        }}
      />

      {/* Overlay de chargement - reste visible jusqu'à ce que le lecteur soit complètement prêt */}
      {(isLoading || !playerReady) && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-900/50 z-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-white animate-spin" />
            <p className="text-white font-medium">Chargement de la vidéo...</p>
          </div>
        </div>
      )}

      {/* Message d'erreur avec bouton pour réessayer */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-900/60 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <h3 className="text-lg font-bold text-red-600 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-700 mb-4">
              Le lecteur vidéo n'a pas pu être chargé correctement.
            </p>
            <button
              onClick={retryLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10 flex flex-row items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer">
          <button
            onClick={togglePlay}
            className="text-slate-300"
            disabled={isLoading || loadError || !playerReady}
          >
            {isPlaying ? (
              <Pause strokeWidth={1.75} />
            ) : (
              <Play strokeWidth={1.75} />
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
      <div className="absolute z-9 left-0 bottom-0 w-full h-full bg-gradient-to-tr from-blue-700 from-0% via-blue-300/0 via-15% to-transparent to-100% opacity-50 pointer-events-none" />

      <div
        id="my-dailymotion-player"
        ref={playerRef}
        className="w-full h-full"
        style={{
          opacity: playerReady ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      ></div>
    </div>
  );
}
