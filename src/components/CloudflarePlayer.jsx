// ...existing code...
"use client";
import { Play, Pause } from "lucide-react";
import Toggl from "./Toggl";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react"; // Importer motion et AnimatePresence

export default function CloudflarePlayer() {
  // URL sans cache-busting pour éviter les rechargements complets
  const videoUrl =
    "https://pub-3a398e3ba4054303b331ad4a0434b478.r2.dev/showreel-site.mp4";
  const thumbnailUrl = "/uploads/showreel-thumbnail.webp";
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true); // true car autoPlay
  const [isMuted, setIsMuted] = useState(true); // La vidéo commence en muet
  const [isHoveringVideo, setIsHoveringVideo] = useState(true);
  const [isHoveringControls, setIsHoveringControls] = useState(false); // Nouvel état pour le survol des contrôles
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
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
    if (isMuted) {
      toggleMute();
    } else {
      togglePlayPause();
    }
  };

  useEffect(() => {
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
          if (videoElement.paused) {
            videoElement.play();
            setIsPlaying(true);
          }
        }
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    if (videoElement) {
      videoElement.addEventListener("play", handlePlay);
      videoElement.addEventListener("pause", handlePause);
      setIsMuted(videoElement.muted);
    }

    window.addEventListener("scroll", handleScroll);

    const handleInitialGlobalMouseMove = (event) => {
      if (playerContainerRef.current) {
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
      }
    };

    window.addEventListener("mousemove", handleInitialGlobalMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleInitialGlobalMouseMove);
      if (videoElement) {
        videoElement.removeEventListener("play", handlePlay);
        videoElement.removeEventListener("pause", handlePause);
      }
    };
  }, []);

  const handleMouseMove = (event) => {
    if (event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  return (
    <div
      ref={playerContainerRef}
      className={`relative w-full h-full ${
        isHoveringVideo && isMuted && !isHoveringControls ? "cursor-none" : "" // Modifié ici
      }`}
      onMouseEnter={() => setIsHoveringVideo(true)}
      onMouseLeave={() => setIsHoveringVideo(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Vidéo HTML */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        poster={thumbnailUrl}
        onClick={handleVideoClick}
      >
        <source src={videoUrl} type="video/mp4" />
        Votre navigateur ne prend pas en charge la lecture vidéo.
      </video>

      {/* Curseur personnalisé qui suit la souris avec animation */}
      <AnimatePresence>
        {isHoveringVideo &&
          isMuted &&
          !isHoveringControls && ( // Modifié ici
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
        className="absolute bottom-4 left-4 flex space-x-4 z-10"
        onMouseEnter={() => setIsHoveringControls(true)} // Ajouté ici
        onMouseLeave={() => setIsHoveringControls(false)} // Ajouté ici
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
  );
}
