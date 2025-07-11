"use client";
import { Play, Pause, Loader2 } from "lucide-react";
import Toggl from "./Toggl";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function CloudflarePlayer({ infoBoxRef }) {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [videoData, setVideoData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHoveringVideo, setIsHoveringVideo] = useState(true);
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [infoBoxHeight, setInfoBoxHeight] = useState(0);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null); // Initialisé à null
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoUrlMobile, setVideoUrlMobile] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const thumbnailUrl = "/uploads/showreel-thumbnail.webp";

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await fetch("/api/accueil/general");
        const data = await response.json();
        console.log("Données de la vidéo récupérées:", data);
        console.log("video_desktop:", data.video_desktop);
        console.log("video_mobile:", data.video_mobile);
        setVideoData(data);
        setVideoUrl(data.video_desktop);
        setVideoUrlMobile(data.video_mobile);

        // Définir immédiatement l'URL appropriée selon la taille d'écran
        const mobile = window.innerWidth < 640;
        const initialVideoUrl = mobile ? data.video_mobile : data.video_desktop;
        console.log(
          "URL vidéo initiale sélectionnée:",
          initialVideoUrl,
          "Mobile:",
          mobile
        );

        // Vérifier que l'URL n'est pas vide ou null
        if (initialVideoUrl && initialVideoUrl.trim() !== "") {
          setCurrentVideoUrl(initialVideoUrl);
          setIsMobile(mobile);
          // On garde isLoading à true jusqu'à ce que la vidéo soit prête
        } else {
          console.error("URL vidéo invalide:", initialVideoUrl);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setIsLoading(false); // Arrêter le loading en cas d'erreur
      }
      // Ne pas mettre isLoading à false ici, laisser la vidéo gérer cet état
    };

    fetchVideoData();
  }, []);

  // Effet pour mesurer la hauteur de la div d'information
  useEffect(() => {
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

  // Effet pour détecter la taille de l'écran et changer l'URL vidéo si nécessaire
  useEffect(() => {
    // Attendre que les données soient chargées et que currentVideoUrl soit définie
    if (!videoData || !videoUrl || !videoUrlMobile || !currentVideoUrl) return;

    const checkIsMobile = () => {
      const mobile = window.innerWidth < 640;
      const newVideoUrl = mobile ? videoUrlMobile : videoUrl;

      // Seulement changer si l'état mobile change ET que l'URL est différente
      if (mobile !== isMobile && newVideoUrl !== currentVideoUrl) {
        setIsMobile(mobile);
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
  }, [videoData, videoUrl, videoUrlMobile, currentVideoUrl, isMobile]);

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
        setIsManuallyPaused(false);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setIsManuallyPaused(true);
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
    const videoElement = videoRef.current;

    // Ne pas exécuter si la vidéo n'existe pas ou si pas d'URL
    if (!videoElement || !currentVideoUrl) return;

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

    const handleLoadedData = () => {
      console.log("Video loadeddata event fired");
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      console.log("Video canplay event fired");
      setIsLoading(false);
    };

    const handleWaiting = () => {
      console.log("Video waiting event fired");
      setTimeout(() => {
        if (videoElement && videoElement.readyState < 3) {
          setIsLoading(true);
        }
      }, 200);
    };

    const handleLoadStart = () => {
      console.log("Video loadstart event fired");
      setIsLoading(true);
    };

    // Attacher les event listeners
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("loadeddata", handleLoadedData);
    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("waiting", handleWaiting);
    videoElement.addEventListener("loadstart", handleLoadStart);
    setIsMuted(videoElement.muted);

    // Vérifier l'état de la vidéo après un petit délai pour s'assurer qu'elle est prête
    const checkVideoState = () => {
      console.log("Checking video state, readyState:", videoElement.readyState);
      if (videoElement.readyState >= 3) {
        console.log(
          "Video ready (readyState >= 3), setting isLoading to false"
        );
        setIsLoading(false);
      } else if (videoElement.readyState >= 1) {
        console.log(
          "Video metadata loaded (readyState >= 1), setting isLoading to false"
        );
        setIsLoading(false);
      }
    };

    // Vérifier immédiatement
    checkVideoState();

    // Et aussi après un petit délai au cas où
    const timeoutId = setTimeout(checkVideoState, 100);

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
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleInitialGlobalMouseMove);
      if (videoElement) {
        videoElement.removeEventListener("play", handlePlay);
        videoElement.removeEventListener("pause", handlePause);
        videoElement.removeEventListener("loadeddata", handleLoadedData);
        videoElement.removeEventListener("waiting", handleWaiting);
        videoElement.removeEventListener("canplay", handleCanPlay);
        videoElement.removeEventListener("loadstart", handleLoadStart);
      }
    };
  }, [isMobile, isManuallyPaused, currentVideoUrl]); // Ajout de currentVideoUrl comme dépendance

  const handleMouseMove = (event) => {
    if (event.currentTarget && !isMobile) {
      const rect = event.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  // Debug logs
  console.log("État actuel:", {
    currentVideoUrl,
    isLoading,
    videoData: !!videoData,
    videoUrl,
    videoUrlMobile,
    videoReadyState: videoRef.current?.readyState,
    videoExists: !!videoRef.current,
    videoSrc: videoRef.current?.src,
  });

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
        {/* Spinner toujours visible tant que l'image ou la vidéo n'est pas prête */}
        {(isLoading || !isImageLoaded) && (
          <div className="absolute inset-0 z-[12] flex items-center justify-center pointer-events-none bg-black/40">
            <Loader2
              className="animate-spin text-white/80"
              size={48}
              strokeWidth={2.5}
            />
          </div>
        )}

        {/* Image placeholder, visible même si elle n'est pas encore chargée */}
        <AnimatePresence>
          {isLoading && (
            <motion.div className="absolute inset-0 z-[11]">
              <Image
                src={thumbnailUrl}
                fill
                alt="Aperçu de la vidéo"
                className="w-full h-full object-cover"
                onLoad={() => setIsImageLoaded(true)}
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vidéo HTML */}
        {currentVideoUrl && (
          <motion.video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            onClick={handleVideoClick}
          >
            <source src={currentVideoUrl} type="video/mp4" />
            Votre navigateur ne prend pas en charge la lecture vidéo.
          </motion.video>
        )}

        {/* Curseur personnalisé qui suit la souris avec animation */}
        <AnimatePresence>
          {!isMobile &&
            isHoveringVideo &&
            isMuted &&
            !isHoveringControls &&
            !isLoading && (
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
