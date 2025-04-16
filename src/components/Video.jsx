import { useState, useRef, useEffect } from "react";
import Tag from "./Tag";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { render } from "react-dom";
import LiteYouTubeEmbed from "react-lite-youtube-embed";

export default function Video({ id, title, types, url }) {
  const [loading, setLoading] = useState(true); // Pour gérer l'état de chargement
  const [isInView, setIsInView] = useState(false); // Pour vérifier si la vidéo est dans la vue
  const videoRef = useRef(null); // Référence pour l'élément vidéo

  let youtubeId = "";
  try {
    const parsedUrl = new URL(url);
    youtubeId = parsedUrl.searchParams.get("v");
  } catch (error) {
    console.error(`❌ URL YouTube invalide (${url}) :`, error);
  }

  // Dès que la vidéo est prête (iframe chargée), on arrête l'animation de chargement
  const handleIframeLoad = () => {
    setLoading(false);
  };

  // Observer pour vérifier si l'élément vidéo est dans la vue
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true); // La vidéo est dans la vue, on commence à charger
            observer.disconnect(); // On se déconnecte de l'observer une fois l'élément visible
          }
        });
      },
      {
        threshold: 0.5, // L'élément doit être à 50% visible pour être chargé
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    // Nettoyage de l'observer lorsqu'on quitte le composant
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video" ref={videoRef}>
        {/* Skeleton loader */}
        {!isInView || loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 opacity-70">
            {/* Skeleton loader */}
            <div className="w-full h-full bg-gradient-to-r from-blue-200 to-blue-50 rounded-lg animate-pulse opacity-70"></div>
          </div>
        ) : null}

        {/* Lorsque la vidéo est dans la vue, charger l'iframe */}
        {isInView && youtubeId ? (
          // <iframe
          //   className="w-full h-full rounded-lg shadow-lg transition-all duration-500"
          //   src={`https://www.youtube.com/embed/${youtubeId}`}
          //   title={title}
          //   frameBorder="0"
          //   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          //   allowFullScreen
          //   onLoad={handleIframeLoad} // Quand l'iframe est chargée, on arrête le chargement
          // />
          <LiteYouTubeEmbed
            id={youtubeId}
            title={title}
            poster="hqdefault"
            webp
          />
        ) : null}
        {!isInView && !youtubeId && (
          <p className="text-red-500">Lien invalide</p>
        )}
      </div>
      <div className="w-full flex items-center justify-between">
        <div className="w-[90%] flex flex-col">
          <p className="w-full text-xl font-extrabold font-rethink-sans text-blue-900 truncate">
            {title}
          </p>
          {types.length > 0 && (
            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2">
              {types.map((t, index) => (
                <Tag key={`${id}-${t}-${index}`} name={t} background={false} />
              ))}
            </div>
          )}
        </div>
        <Link
          href={`/creations/${id}`}
          passHref
          legacyBehavior
          className="flex justify-center items-center p-2 text-blue-700 min-w-9 w-[10%] hover:text-blue-900 transition-colors"
        >
          <SquareArrowOutUpRight size={16} strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}
