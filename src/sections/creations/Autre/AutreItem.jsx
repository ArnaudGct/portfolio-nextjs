"use client";
import { useState, useRef, useEffect } from "react";
import Tag from "../../../components/Tag";
import { SquareArrowOutUpRight, Loader2 } from "lucide-react";
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
          {/* Spinner de chargement centré - affiché pendant le chargement */}
          {(!isInView || loading) && (
            <div className="absolute inset-0 bg-blue-50 rounded-lg z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-sm text-blue-600 font-medium">
                  Chargement de l'image...
                </p>
              </div>
            </div>
          )}

          {/* Lorsque l'élément est dans la vue et que l'image est prête */}
          {isInView && (
            <Image
              alt={title}
              src={miniature}
              fill
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              priority={false}
              className={`object-cover rounded-lg transition-all duration-500 group-hover:scale-105 ${
                loading ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
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
