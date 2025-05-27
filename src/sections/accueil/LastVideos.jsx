"use client";
import { useEffect, useState } from "react";
import Video from "../creations/Videos/VideoItem";
import ButtonMain from "../../components/ButtonMain";
import { ArrowUpRight, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/accueil/videos");
        const data = await res.json();
        console.log("✅ Vidéos reçues :", data);
        setVideos(data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des vidéos :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <section className="w-full bg-blue-50 py-16">
      <div className="flex flex-col gap-10 max-w-[1440px] mx-auto w-[90%]">
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col">
            <p className="text-blue-600 text-3xl font-extrabold font-rethink-sans">
              Mes dernières créations
            </p>
            <p className="text-blue-900 text-normal font-normal font-outfit">
              Une sélection variée de mes récentes créations en montage vidéo.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              // Skeleton loader pendant le chargement
              <>
                {[...Array(4)].map((_, index) => (
                  <motion.div
                    key={`video-skeleton-${index}`}
                    className="rounded-lg overflow-hidden"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <div className="flex flex-col gap-4">
                      {/* Placeholder pour la miniature vidéo (ratio 16:9) */}
                      <div className="relative w-full aspect-video bg-blue-200/70 rounded-lg">
                        {/* Icône de lecture au centre */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-blue-400/60 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="w-full flex flex-col gap-3">
                        {/* Placeholder pour le titre */}
                        <div className="w-3/4 h-6 bg-blue-300/80 rounded-md"></div>
                        {/* Placeholders pour les tags */}
                        <div className="flex gap-2 mt-1">
                          <div className="w-16 h-5 bg-blue-300/80 rounded-full"></div>
                          <div className="w-20 h-5 bg-blue-300/80 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            ) : (
              // Affichage des vidéos une fois chargées
              videos.map((video) => (
                <Video
                  key={video.id_vid}
                  id={video.id_vid}
                  title={video.titre}
                  url={video.lien}
                  tags={video.tags}
                  pageCurrent="home"
                />
              ))
            )}
          </div>
        </div>
        <ButtonMain
          icon={<ArrowUpRight size={16} />}
          link="/creations"
          newTab={false}
          size="base"
          className="w-full xs:w-auto"
        >
          Toutes mes créations
        </ButtonMain>
      </div>
    </section>
  );
}
