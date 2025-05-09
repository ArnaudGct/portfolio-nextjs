"use client";
import { useEffect, useRef, useState } from "react";
import Toggl from "./Toggl";
import { Play, Pause, Loader2 } from "lucide-react";

export default function VimeoPlayer() {
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const scriptLoadAttempts = useRef(0);
  const initializeAttempts = useRef(0);

  // Utilisation d'un ID de vidéo Vimeo public connu qui fonctionne
  const videoId = "883001767"; // Votre ID vidéo Vimeo

  // Gérer le script Vimeo Player avec une approche plus simple mais robuste
  useEffect(() => {
    let isMounted = true;
    const maxAttempts = 3;

    // Fonction pour charger le script Vimeo
    function loadVimeoScript() {
      return new Promise((resolve, reject) => {
        if (typeof window === "undefined") return reject("Window not defined");

        // Vérifier si le script est déjà chargé
        if (window.Vimeo) {
          return resolve(window.Vimeo);
        }

        const script = document.createElement("script");
        script.id = "vimeoScript";
        script.src = "https://player.vimeo.com/api/player.js";
        script.async = true;

        script.onload = () => {
          console.log("✅ Script Vimeo chargé avec succès");
          resolve(window.Vimeo);
        };

        script.onerror = (e) => {
          console.error("❌ Erreur de chargement du script Vimeo:", e);
          reject(e);
        };

        document.body.appendChild(script);
      });
    }

    // Fonction pour initialiser le lecteur
    async function initializePlayer() {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        setLoadError(false);

        console.log("🔄 Tentative d'initialisation du lecteur Vimeo...");

        // Vérifier le nombre de tentatives
        if (scriptLoadAttempts.current >= maxAttempts) {
          console.error("❌ Nombre maximum de tentatives atteint");
          setLoadError(true);
          setIsLoading(false);
          return;
        }

        scriptLoadAttempts.current += 1;

        // Charger le script Vimeo si nécessaire
        await loadVimeoScript();

        // Vérifier que le conteneur DOM est disponible
        if (!playerRef.current) {
          console.warn(
            "⚠️ Conteneur non disponible, nouvelle tentative dans 200ms"
          );
          setTimeout(initializePlayer, 200);
          return;
        }

        // S'assurer que le conteneur est vide
        playerRef.current.innerHTML = "";

        try {
          console.log("🔄 Création du player avec adaptation au viewport");

          // Créer un conteneur pour l'iframe qui remplira tout l'espace disponible
          const wrapperDiv = document.createElement("div");
          wrapperDiv.style.position = "relative";
          wrapperDiv.style.width = "100%";
          wrapperDiv.style.height = "100%";
          wrapperDiv.style.overflow = "hidden";
          playerRef.current.appendChild(wrapperDiv);

          // Créer l'iframe directement avec les paramètres optimisés
          const iframe = document.createElement("iframe");
          iframe.src = `https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&loop=1&title=0&byline=0&portrait=0&muted=1&transparent=0`;
          iframe.style.position = "absolute";
          iframe.style.top = "50%";
          iframe.style.left = "50%";
          iframe.style.transform = "translate(-50%, -50%)";
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.border = "0";
          iframe.style.minWidth = "100%";
          iframe.style.minHeight = "100%";
          iframe.style.objectFit = "cover";
          iframe.setAttribute("frameborder", "0");
          iframe.setAttribute(
            "allow",
            "autoplay; fullscreen; picture-in-picture"
          );
          wrapperDiv.appendChild(iframe);

          // Création d'une interface pour contrôler l'iframe
          const iframePlayer = {
            play: () => {
              iframe.contentWindow.postMessage('{"method":"play"}', "*");
              setIsPlaying(true);
            },
            pause: () => {
              iframe.contentWindow.postMessage('{"method":"pause"}', "*");
              setIsPlaying(false);
            },
            setVolume: (vol) => {
              iframe.contentWindow.postMessage(
                `{"method":"setVolume","value":${vol}}`,
                "*"
              );
            },
            destroy: () => {
              if (playerRef.current) {
                playerRef.current.innerHTML = "";
              }
            },
            on: (event, callback) => {
              // Simulation minimale des événements
              if (event === "play") {
                setTimeout(() => setIsPlaying(true), 500);
              }
            },
          };

          setPlayer(iframePlayer);
          setIsLoading(false);
          setIsPlaying(true);

          // Événement de défilement pour l'iframe
          const handleIframeScroll = () => {
            if (window.scrollY <= 10) {
              iframePlayer.play();
            } else {
              iframePlayer.pause();
            }
          };

          window.addEventListener("scroll", handleIframeScroll);

          return () => {
            window.removeEventListener("scroll", handleIframeScroll);
          };
        } catch (error) {
          console.error("❌ Erreur avec l'iframe simple:", error);
          setLoadError(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("❌ Erreur lors de l'initialisation du lecteur:", error);

        if (isMounted) {
          initializeAttempts.current += 1;

          if (initializeAttempts.current >= maxAttempts) {
            setLoadError(true);
            setIsLoading(false);
          } else {
            setTimeout(initializePlayer, 1000 * initializeAttempts.current);
          }
        }
      }
    }

    // Commencer l'initialisation du lecteur
    initializePlayer();

    return () => {
      console.log("🧹 Nettoyage du composant VimeoPlayer");
      isMounted = false;

      if (player) {
        try {
          player.destroy();
        } catch (err) {
          console.warn("Erreur lors de la destruction du lecteur:", err);
        }
      }
    };
  }, [videoId]);

  // Toggle Mute
  const toggleMute = async () => {
    if (!player) return;

    try {
      if (muted) {
        await player.setVolume(1);
      } else {
        await player.setVolume(0);
      }
      setMuted(!muted);
    } catch (err) {
      console.error("Erreur lors de la modification du volume:", err);
    }
  };

  // Fonction pour démarrer ou mettre en pause la vidéo
  const togglePlay = async () => {
    if (!player) return;

    try {
      if (isPlaying) {
        await player.pause();
      } else {
        await player.play();
      }
    } catch (err) {
      console.error("Erreur lors du contrôle de la lecture:", err);
    }
  };

  // Fonction pour retenter le chargement si erreur
  const retryLoading = () => {
    console.log("🔄 Nouvelle tentative de chargement");
    scriptLoadAttempts.current = 0;
    initializeAttempts.current = 0;
    setLoadError(false);

    // Supprimer l'ancien script pour un chargement propre
    const existingScript = document.getElementById("vimeoScript");
    if (existingScript) existingScript.remove();

    // Réinitialiser le lecteur
    if (player) {
      try {
        player.destroy();
      } catch (err) {}
      setPlayer(null);
    }

    // Vider le conteneur
    if (playerRef.current) {
      playerRef.current.innerHTML = "";
    }

    // Force react à re-rendre le composant
    setIsLoading(true);

    // Déclencher un événement resize après un court délai
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("resize"));
      }
    }, 300);
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Overlay de chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-900/20 z-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-white animate-spin" />
            <p className="text-white font-medium">Chargement de la vidéo...</p>
          </div>
        </div>
      )}

      {/* Message d'erreur avec bouton pour réessayer */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-900/40 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <h3 className="text-lg font-bold text-red-600 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-700 mb-4">
              Le lecteur vidéo n'a pas pu être chargé correctement.
            </p>
            <button
              onClick={retryLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            disabled={isLoading || loadError}
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
            disabled={isLoading || loadError}
          />
          <p
            className="text-slate-300 text-sm font-normal font-rethink-sans"
            onClick={toggleMute}
          >
            {muted ? "Activer le son" : "Couper le son"}
          </p>
        </div>
      </div>

      {/* Dégradé décoratif */}
      <div className="absolute z-9 left-0 bottom-0 w-full h-full bg-gradient-to-tr from-blue-700 from-0% via-blue-300/0 via-15% to-transparent to-100% opacity-50 pointer-events-none" />

      {/* Conteneur du lecteur Vimeo */}
      <div ref={playerRef} className="w-full h-full bg-black"></div>
    </div>
  );
}
