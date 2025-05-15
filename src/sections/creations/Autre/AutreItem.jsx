"use client";
import { useState, useRef, useEffect } from "react";
import Tag from "../../../components/Tag";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AutreItem({ id, title, tags, miniature }) {
  const [loading, setLoading] = useState(true); // Pour gérer l'état de chargement
  const [isInView, setIsInView] = useState(false); // Pour vérifier si l'image est dans la vue
  const videoRef = useRef(null); // Référence pour l'élément vidéo

  // Observer pour vérifier si l'élément est dans la vue
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true); // L'élément est dans la vue, on commence à charger l'image
            observer.disconnect(); // On se déconnecte de l'observer une fois l'élément visible
          }
        });
      },
      {
        threshold: 0.5, // L'élément doit être à 50% visible pour commencer à charger
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

  // Fonction appelée lorsque l'image est complètement chargée
  const handleImageLoad = () => {
    setLoading(false); // L'image est complètement chargée
  };

  return (
    <div className="">
      <Link
        href={`/creations/autre/${id}`}
        className="cursor-pointer flex flex-col gap-4 group"
      >
        <div
          className="relative aspect-video overflow-hidden rounded-lg"
          ref={videoRef}
        >
          {/* Skeleton loader */}
          {!isInView || loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 opacity-70">
              <div className="w-full h-full bg-gradient-to-r from-blue-200 to-blue-50 rounded-lg animate-pulse opacity-70"></div>
            </div>
          ) : null}

          {/* Lorsque l'élément est dans la vue et que l'image est prête */}
          {isInView && (
            <Image
              alt={title}
              src={miniature}
              fill
              className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
              onLoad={handleImageLoad} // Cette fonction est appelée lorsque l'image est chargée
            />
          )}
        </div>

        <div className="w-full flex items-center justify-between">
          <div className="w-[90%] flex flex-col gap-2">
            <p className="w-full text-xl font-extrabold font-rethink-sans text-blue-900 truncate">
              {title}
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                {[...tags]
                  .sort((a, b) => (b.important || 0) - (a.important || 0)) // les importants en premier
                  .map((tag, index) => (
                    <Tag
                      key={`${id}-tag-${tag.titre}-${index}`}
                      name={tag.titre}
                      background={tag.important ? "blue" : false}
                    />
                  ))}
              </div>
            )}
          </div>
          <div className="flex justify-center items-center p-2 text-blue-700 min-w-9 w-[10%] hover:text-blue-900 transition-colors">
            <SquareArrowOutUpRight size={16} strokeWidth={1.75} />
          </div>
        </div>
      </Link>
    </div>
  );
}
