"use client";
import { useEffect, useRef, useState } from "react";
import Toggl from "./Toggl";
import { Play, Pause } from "lucide-react";

export default function DailymotionPlayer() {
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false); // État pour savoir si la vidéo est en lecture ou en pause

  // Gérer le script Dailymotion selon la taille d'écran
  useEffect(() => {
    function toggleScriptTag() {
      const existingScript = document.getElementById("dailymotionScript");
      const existingPreload = document.getElementById("dailymotionPreloadLink");

      if (existingScript && existingPreload) {
        existingScript.remove();
        existingPreload.remove();
      } else if (!existingScript && !existingPreload) {
        const script = document.createElement("script");
        script.id = "dailymotionScript";
        script.src = "https://geo.dailymotion.com/libs/player/xkmhv.js";
        document.body.appendChild(script);

        const preload = document.createElement("link");
        preload.id = "dailymotionPreloadLink";
        preload.rel = "preload";
        preload.href = "https://geo.dailymotion.com/libs/player/xkmhv.js";
        preload.as = "script";
        document.head.appendChild(preload);

        script.onload = () => {
          createPlayer();
        };
      }
    }

    toggleScriptTag();
  }, []);

  // Créer le lecteur
  function createPlayer() {
    if (typeof dailymotion !== "undefined") {
      dailymotion
        .createPlayer("my-dailymotion-player", {
          video: "k64y7uhzsITk5IzREtu",
          params: {
            loop: "true",
            scaleMode: "fill",
            mute: "true",
          },
        })
        .then((p) => {
          setPlayer(p);

          p.on("playing", () => {
            setIsPlaying(true); // La vidéo commence à jouer
          });

          p.on("pause", () => {
            setIsPlaying(false); // La vidéo est mise en pause
          });

          window.addEventListener("scroll", () => {
            if (window.scrollY <= 10) {
              p.play();
            } else {
              p.pause();
            }
          });
        })
        .catch((e) => console.error(e));
    }
  }

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
      setIsPlaying(!isPlaying); // Alterne l'état de lecture de la vidéo
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute bottom-4 left-4 z-10 flex flex-row items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer">
          <button onClick={togglePlay} className="text-slate-300">
            {isPlaying ? (
              <Play strokeWidth={1.75} />
            ) : (
              <Pause strokeWidth={1.75} />
            )}
          </button>
          <p
            className="text-slate-300 text-sm font-normal font-rethink-sans"
            onClick={togglePlay} // Permet de changer l'état en cliquant sur le texte aussi
          >
            {isPlaying ? "Lecture" : "Pause"}
          </p>
        </div>
        <div className="flex items-center gap-1 cursor-pointer">
          <Toggl isChecked={muted} setIsChecked={toggleMute} />
          <p
            className="text-slate-300 text-sm font-normal font-rethink-sans"
            onClick={toggleMute}
          >
            {muted ? "Activer le son" : "Couper le son"}
          </p>
        </div>
      </div>
      <div className="absolute z-9 left-0 bottom-0 w-full h-full bg-gradient-to-tr from-blue-700 from-0% via-blue-300/0 via-15% to-transparent to-100% opacity-50 pointer-events-none" />

      <div id="my-dailymotion-player" ref={playerRef}></div>
    </div>
  );
}
