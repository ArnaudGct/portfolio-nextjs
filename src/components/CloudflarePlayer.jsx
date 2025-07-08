"use client";
import { Play, Pause, Loader2 } from "lucide-react";
import Toggl from "./Toggl";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CloudflarePlayer({ infoBoxRef }) {
  // URL sans cache-busting pour éviter les rechargements complets
  const videoUrl =
    "https://pub-3a398e3ba4054303b331ad4a0434b478.r2.dev/showreel-169.mp4";
  const videoUrlMobile =
    "https://pub-3a398e3ba4054303b331ad4a0434b478.r2.dev/showreel-916.mp4";
  const thumbnailUrl = "/uploads/showreel-thumbnail.webp";
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHoveringVideo, setIsHoveringVideo] = useState(true);
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [infoBoxHeight, setInfoBoxHeight] = useState(0);

  // Effet pour mesurer la hauteur de la div d'information
  useEffect(() => {
    setIsLoading(true);
    if (!infoBoxRef?.current) return;

    const element = infoBoxRef.current;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setInfoBoxHeight(entry.target.offsetHeight);
      }
    });
    observer.observe(element);
    // Mesure initiale
    setInfoBoxHeight(element.offsetHeight);
    return () => observer.unobserve(element);
  }, [infoBoxRef]);

  // Effet pour détecter la taille de l'écran (mobile/desktop)
  useEffect(() => {
    setIsLoading(true);

    const checkIsMobile = () => {
      const mobile = window.innerWidth < 640; // Même breakpoint que Hero (640px pour 'sm')
      setIsMobile(mobile);

      // Mettre à jour l'URL de la vidéo selon le type d'appareil
      const newVideoUrl = mobile ? videoUrlMobile : videoUrl;

      if (newVideoUrl !== currentVideoUrl) {
        setCurrentVideoUrl(newVideoUrl);

        // Si la vidéo est déjà chargée et que l'URL change, recharger la vidéo
        if (videoRef.current && videoRef.current.src) {
          setIsLoading(true);
          const wasPlaying = !videoRef.current.paused;
          const currentTime = videoRef.current.currentTime;

          videoRef.current.src = newVideoUrl;
          videoRef.current.load();

          // Restaurer l'état de lecture après le chargement
          videoRef.current.addEventListener(
            "loadeddata",
            () => {
              if (videoRef.current) {
                videoRef.current.currentTime = currentTime;
                if (wasPlaying) {
                  videoRef.current.play();
                }
                setIsLoading(false);
              }
            },
            { once: true }
          );
        }
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [currentVideoUrl]);

  // Calculer le style du conteneur vidéo
  const videoContainerStyle =
    isMobile && infoBoxHeight > 0
      ? {
          top: `${64 + infoBoxHeight}px`,
          height: `calc(100vh - ${64 + infoBoxHeight}px)`,
        }
      : {
          top: "64px",
          height: "calc(100vh - 64px)",
        };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        setIsManuallyPaused(false); // Réinitialiser quand on relance
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setIsManuallyPaused(true); // Marquer comme mis en pause manuellement
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVideoClick = () => {
    if (!isPlaying && isMuted) {
      toggleMute();
      videoRef.current.play();
      setIsPlaying(true);
      setIsManuallyPaused(false);
    } else if (isMuted) {
      toggleMute();
    } else {
      togglePlayPause();
    }
  };

  useEffect(() => {
    setIsLoading(true);

    const videoElement = videoRef.current;

    const handleScroll = () => {
      if (videoElement) {
        const rect = videoElement.getBoundingClientRect();
        if (window.scrollY > window.innerHeight * 0.8) {
          if (!videoElement.paused) {
            videoElement.pause();
            setIsPlaying(false);
          }
        } else {
          if (videoElement.paused && !isManuallyPaused) {
            videoElement.play();
            setIsPlaying(true);
          }
        }
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    // Optimiser la gestion du loading
    const handleLoadedData = () => {
      // Ajouter un petit délai pour éviter le scintillement
      setTimeout(() => setIsLoading(false), 100);
    };

    const handleCanPlay = () => {
      // Plus agressif pour cacher le loader dès que possible
      setIsLoading(false);
    };

    const handleWaiting = () => {
      // Seulement montrer le loader si ça prend du temps
      setTimeout(() => {
        if (videoElement && videoElement.readyState < 3) {
          setIsLoading(true);
        }
      }, 200);
    };

    if (videoElement) {
      videoElement.addEventListener("play", handlePlay);
      videoElement.addEventListener("pause", handlePause);
      videoElement.addEventListener("loadeddata", handleLoadedData);
      videoElement.addEventListener("canplay", handleCanPlay);
      videoElement.addEventListener("waiting", handleWaiting);
      setIsMuted(videoElement.muted);

      // Vérifier immédiatement si la vidéo est déjà prête
      if (videoElement.readyState >= 3) {
        setIsLoading(false);
      }
    }

    window.addEventListener("scroll", handleScroll);

    const handleInitialGlobalMouseMove = (event) => {
      if (playerContainerRef.current && !isMobile) {
        const rect = playerContainerRef.current.getBoundingClientRect();
        const isOver =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (isOver) {
          setIsHoveringVideo(true);
        }
        window.removeEventListener("mousemove", handleInitialGlobalMouseMove);
      } else if (isMobile) {
        window.removeEventListener("mousemove", handleInitialGlobalMouseMove);
      }
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleInitialGlobalMouseMove);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleInitialGlobalMouseMove);
      if (videoElement) {
        videoElement.removeEventListener("play", handlePlay);
        videoElement.removeEventListener("pause", handlePause);
        videoElement.removeEventListener("loadeddata", handleLoadedData);
        videoElement.removeEventListener("waiting", handleWaiting);
        videoElement.removeEventListener("canplay", handleCanPlay);
      }
    };
  }, [isMobile, isManuallyPaused]);

  const handleMouseMove = (event) => {
    if (event.currentTarget && !isMobile) {
      // Ne pas suivre la souris sur mobile
      const rect = event.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  return (
    <div className="absolute left-0 w-full z-10" style={videoContainerStyle}>
      <div
        ref={playerContainerRef}
        className={`relative w-full h-full overflow-hidden ${
          !isMobile && isHoveringVideo && isMuted && !isHoveringControls
            ? "cursor-none"
            : ""
        }`}
        onMouseEnter={() => {
          if (!isMobile) setIsHoveringVideo(true);
        }}
        onMouseLeave={() => {
          if (!isMobile) setIsHoveringVideo(false);
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Image placeholder pendant le chargement */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0 z-[11]"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={thumbnailUrl}
                alt="Aperçu de la vidéo"
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vidéo HTML */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          onClick={handleVideoClick}
        >
          <source src={currentVideoUrl} type="video/mp4" />
          Votre navigateur ne prend pas en charge la lecture vidéo.
        </video>

        {/* Curseur personnalisé qui suit la souris avec animation */}
        <AnimatePresence>
          {!isMobile && // Ne pas afficher sur mobile
            isHoveringVideo &&
            isMuted &&
            !isHoveringControls &&
            !isLoading && ( // Ne pas afficher pendant le chargement
              <motion.div
                className="absolute pointer-events-none z-[15] transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${mousePosition.x}px`,
                  top: `${mousePosition.y}px`,
                }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="bg-black/60 text-white rounded-full p-3 w-36 h-36 flex items-center justify-center text-center text-sm shadow-lg">
                  Activer le son
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        <div className="absolute z-[9] left-0 bottom-0 w-full h-full bg-gradient-to-tr from-blue-700 from-0% via-blue-300/0 via-15% to-transparent to-100% opacity-50 pointer-events-none" />

        {/* Boutons de contrôle */}
        <div
          className={`absolute bottom-4 left-4 flex space-x-4 z-10 transition-opacity duration-300 ${
            isLoading ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          onMouseEnter={() => {
            if (!isMobile) setIsHoveringControls(true);
          }}
          onMouseLeave={() => {
            if (!isMobile) setIsHoveringControls(false);
          }}
        >
          {/* Bouton Play/Pause */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayPause}
              className="text-slate-300 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors duration-300 cursor-pointer"
              aria-label={isPlaying ? "Mettre en pause" : "Lancer la lecture"}
            >
              {isPlaying ? (
                <Pause size={20} strokeWidth={1.75} />
              ) : (
                <Play size={20} strokeWidth={1.75} />
              )}
            </button>
          </div>
          {/* Bouton Mute/Unmute */}
          <div className="flex items-center gap-1">
            <Toggl isChecked={isMuted} setIsChecked={toggleMute} />
            <span
              className="text-slate-300 text-sm font-normal font-rethink-sans cursor-pointer"
              onClick={toggleMute}
            >
              {isMuted ? "Activer le son" : "Couper le son"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
