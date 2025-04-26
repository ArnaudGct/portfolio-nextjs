"use client";
import { useEffect, useState } from "react";
import Video from "../../components/VideoItem";
import ButtonMain from "../../components/ButtonMain";
import { ArrowUpRight } from "lucide-react";

export default function Videos() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/accueil/videos");
        const data = await res.json();
        console.log("✅ Vidéos reçues :", data);
        setVideos(data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des vidéos :", error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <section className="w-full bg-blue-50 py-16 mt-20">
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
            {videos.map((video) => (
              <Video
                key={video.id_crea}
                id={video.id_crea}
                title={video.titre}
                url={video.lien}
                tags={video.tags}
              />
            ))}
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
