"use client";
import { useEffect, useRef, useState } from "react";
import Toggl from "./Toggl";
import { Play, Pause, Loader2, RefreshCw } from "lucide-react";

export default function DailymotionPlayer() {
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const scriptLoadAttempts = useRef(0);
  const playerInitAttempts = useRef(0);
  const timeoutRef = useRef(null);
  const videoId = "k64y7uhzsITk5IzREtu";
  const thumbnailUrl = `https://www.dailymotion.com/thumbnail/video/${videoId}`;

  // Gérer le script Dailymotion avec une approche plus robuste
  useEffect(() => {
    let isMounted = true;
    const maxScriptAttempts = 3;
    const maxPlayerAttempts = 3;

    // Fonction pour nettoyer les timeouts
    const clearTimeouts = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    // Fonction pour charger le script Dailymotion
    function loadDailymotionScript() {
      return new Promise((resolve, reject) => {
        if (typeof window === "undefined") return reject("Window not defined");

        // Vérifier si le script est déjà chargé
        if (window.dailymotion) {
          console.log("Script Dailymotion déjà chargé");
          return resolve(window.dailymotion);
        }

        console.log("Chargement du script Dailymotion...");
        const script = document.createElement("script");
        script.id = "dailymotionScript";
        script.src = "https://geo.dailymotion.com/libs/player/xkmhv.js";
        script.async = true;

        // Définir un timeout pour le chargement du script
        const scriptTimeout = setTimeout(() => {
          reject(new Error("Timeout lors du chargement du script Dailymotion"));
        }, 10000); // 10 secondes de timeout

        script.onload = () => {
          console.log("Script Dailymotion chargé avec succès");
          clearTimeout(scriptTimeout);
          // Attendre un court instant pour s'assurer que l'API est bien initialisée
          setTimeout(() => resolve(window.dailymotion), 200);
        };

        script.onerror = (e) => {
          clearTimeout(scriptTimeout);
          reject(new Error("Erreur de chargement du script Dailymotion"));
        };

        document.body.appendChild(script);
      });
    }

    // Fonction pour créer le lecteur
    async function createPlayer() {
      if (!isMounted) return;
      if (!window.dailymotion) {
        console.error("L'API Dailymotion n'est pas disponible");
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Création du lecteur...");
        playerInitAttempts.current += 1;

        // S'assurer que le DOM est prêt
        if (!playerRef.current) {
          console.log(
            "Conteneur DOM non disponible, nouvelle tentative dans 300ms"
          );
          timeoutRef.current = setTimeout(createPlayer, 300);
          return;
        }

        const playerInstance = await window.dailymotion.createPlayer(
          "my-dailymotion-player",
          {
            video: videoId,
            params: {
              loop: "true",
              scaleMode: "fill",
              mute: "true",
              "ui-start-screen-info": false,
              "ui-logo": false,
              controls: false,
              autoplay: true,
              muted: true,
              // Précharger la vidéo
              startup_quality: "240",
              "queue-enable": false,
            },
          }
        );

        if (isMounted) {
          console.log("Lecteur créé avec succès");
          setPlayer(playerInstance);

          // Définir un timeout pour la préparation du lecteur
          const readyTimeout = setTimeout(() => {
            if (isMounted && !playerReady) {
              console.log("Timeout de préparation du lecteur atteint");
              setLoadTimeout(true);
              setIsLoading(false);
            }
          }, 8000); // 8 secondes maximum pour le chargement

          playerInstance.on("playback_ready", () => {
            if (isMounted) {
              console.log("Lecteur prêt à lire");
              clearTimeout(readyTimeout);

              // Attendre que la vidéo soit vraiment prête
              timeoutRef.current = setTimeout(() => {
                setIsLoading(false);
                setPlayerReady(true);
                setLoadTimeout(false);
              }, 500);
            }
          });

          playerInstance.on("playing", () => {
            if (isMounted) {
              console.log("Lecture démarrée");
              setIsPlaying(true);
              setLoadTimeout(false);
              setPlayerReady(true);
              setIsLoading(false);
            }
          });

          playerInstance.on("pause", () => {
            if (isMounted) setIsPlaying(false);
          });

          playerInstance.on("error", (error) => {
            console.error("Erreur du lecteur Dailymotion:", error);
            if (isMounted && playerInitAttempts.current < maxPlayerAttempts) {
              // Réessayer de créer le lecteur
              timeoutRef.current = setTimeout(createPlayer, 1500);
            } else {
              setLoadError(true);
              setIsLoading(false);
            }
          });

          // Gérer le défilement
          const handleScroll = () => {
            if (playerInstance && typeof playerInstance.play === "function") {
              if (window.scrollY <= 10) {
                playerInstance.play();
              } else {
                playerInstance.pause();
              }
            }
          };

          window.addEventListener("scroll", handleScroll);
          return () => window.removeEventListener("scroll", handleScroll);
        }
      } catch (error) {
        console.error("Erreur lors de la création du lecteur:", error);
        if (isMounted && playerInitAttempts.current < maxPlayerAttempts) {
          timeoutRef.current = setTimeout(createPlayer, 1500);
        } else {
          setLoadError(true);
          setIsLoading(false);
        }
      }
    }

    // Fonction principale d'initialisation
    async function initializePlayer() {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        setLoadError(false);
        setPlayerReady(false);
        setLoadTimeout(false);

        if (scriptLoadAttempts.current >= maxScriptAttempts) {
          console.error(
            "Nombre maximal de tentatives de chargement du script atteint"
          );
          setLoadError(true);
          setIsLoading(false);
          return;
        }

        scriptLoadAttempts.current += 1;
        console.log(
          `Tentative de chargement du script ${scriptLoadAttempts.current}/${maxScriptAttempts}`
        );

        // Charger le script Dailymotion
        await loadDailymotionScript();

        // Créer le lecteur
        createPlayer();
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        if (isMounted && scriptLoadAttempts.current < maxScriptAttempts) {
          // Attendre un peu plus avant de réessayer le chargement du script
          timeoutRef.current = setTimeout(initializePlayer, 2000);
        } else {
          setLoadError(true);
          setIsLoading(false);
        }
      }
    }

    // Commencer l'initialisation du lecteur
    initializePlayer();

    return () => {
      isMounted = false;
      clearTimeouts();

      // Nettoyer le lecteur s'il existe
      if (player && typeof player.destroy === "function") {
        try {
          player.destroy();
        } catch (e) {
          console.error("Erreur lors de la destruction du lecteur:", e);
        }
      }
    };
  }, []);

  // Toggle Mute
  const toggleMute = () => {
    if (player && typeof player.setMute === "function") {
      try {
        player.setMute(!muted);
        setMuted(!muted);
      } catch (e) {
        console.error("Erreur lors du changement de l'état muet:", e);
      }
    }
  };

  // Fonction pour démarrer ou mettre en pause la vidéo
  const togglePlay = () => {
    if (!player) return;

    try {
      if (isPlaying && typeof player.pause === "function") {
        player.pause();
      } else if (!isPlaying && typeof player.play === "function") {
        player.play();
      }
    } catch (e) {
      console.error("Erreur lors du changement de l'état de lecture:", e);
    }
  };

  // Fonction pour retenter le chargement si erreur
  const retryLoading = () => {
    scriptLoadAttempts.current = 0;
    playerInitAttempts.current = 0;
    setLoadError(false);
    setLoadTimeout(false);

    // Supprimer l'ancien script pour un chargement propre
    const existingScript = document.getElementById("dailymotionScript");
    if (existingScript) existingScript.remove();

    // Nettoyer les références globales
    if (typeof window !== "undefined") {
      if (window.dailymotion) {
        window.dailymotion = undefined;
      }
      if (window.dmAsyncInit) {
        window.dmAsyncInit = undefined;
      }
    }

    // Réinitialiser le lecteur
    setPlayer(null);

    // Si le div existe encore, le vider
    if (playerRef.current) {
      playerRef.current.innerHTML = "";
    }

    // Déclencher un nouveau chargement avec un court délai
    setTimeout(() => {
      window.location.reload(); // Solution la plus fiable pour recharger complètement
    }, 300);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background thumbnail - reste visible jusqu'à ce que le lecteur soit complètement prêt */}
      <div
        className="absolute inset-0 z-1 overflow-hidden"
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
            {loadTimeout && (
              <button
                onClick={retryLoading}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Chargement lent, cliquez pour recharger</span>
              </button>
            )}
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
            <p className="text-slate-700 mb-4">
              Le lecteur vidéo n'a pas pu être chargé correctement.
            </p>
            <button
              onClick={retryLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
              <span>Réessayer</span>
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
            {isPlaying ? "Pause" : "Lecture"}
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
