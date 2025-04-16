"use client";
import { useState, useEffect } from "react";
import ButtonSecondary from "./../../src/components/ButtonSecondary";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FormattedDate from "./../../src/components/FormattedDate";
import Image from "next/image"; // Importation du composant Image de Next.js

export default function JournalPersonnel() {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const res = await fetch("/api/journal-personnel");
        const data = await res.json();
        console.log("✅ Expériences reçues :", data);
        setExperiences(data);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des expériences :",
          error
        );
      }
    };

    fetchExperiences();
  }, []);

  // Fonction pour obtenir l'ID de la vidéo YouTube à partir de l'URL
  const getYouTubeId = (url) => {
    try {
      const parsedUrl = new URL(url);
      const youtubeId = parsedUrl.searchParams.get("v");
      return youtubeId || null;
    } catch (e) {
      console.error("Erreur dans l'analyse de l'URL YouTube :", e);
      return null;
    }
  };

  return (
    <main className="h-[7000px]">
      <div className="flex flex-col w-[90%] mx-auto max-w-[1440px] gap-8 mt-20 mb-20">
        <div className="flex flex-row items-center gap-4">
          <ButtonSecondary
            link="/apropos"
            icon={<ArrowLeft size={16} strokeWidth={1.75} />}
          >
            Retour
          </ButtonSecondary>
          <div className="hidden xs:flex items-center justify-start">
            <Link
              href={"/apropos"}
              className="text-blue-300 hover:underline cursor-pointer"
            >
              {" "}
              À propos
            </Link>
            <span className="mx-2 text-blue-300">/</span>
            <p className="text-blue-600 font-medium">Journal personnel</p>
          </div>
        </div>
        <div>
          <p className="text-3xl font-extrabold font-rethink-sans text-blue-600">
            Mon journal personnel
          </p>
          <p className="text-lg text-blue-900">
            De YouTube au freelance, en passant par la création d’applications
            et des concours de court-métrage, je tente toujours à repousser mes
            limites.
          </p>
        </div>
        <div className="relative">
          {/* Ligne verticale */}
          <div className="border-l-1 border-blue-300 absolute left-2 top-0 bottom-0"></div>

          {experiences.map((experience, index) => (
            <div
              key={experience.id_exp}
              className="relative flex items-center mb-8"
            >
              {/* Point */}
              <div className="absolute left-0 top-6 w-4 h-4 bg-blue-600 rounded-full"></div>

              {/* Contenu de l'expérience */}
              <div className="ml-10 flex flex-col gap-4">
                <div className="flex flex-col">
                  <p className="text-blue-600 font-rethink-sans font-extrabold text-xl">
                    <FormattedDate date={experience.date_debut} />
                  </p>
                  <p className="text-blue-500 text-lg">{experience.titre}</p>
                </div>
                <div className="flex flex-col items-start justify-center lg:flex-row lg:justify-between gap-6 ">
                  <p
                    className="text-blue-900 flex flex-col gap-4 w-full"
                    dangerouslySetInnerHTML={{ __html: experience.description }}
                  ></p>

                  {/* Affichage de l'image ou vidéo */}
                  {experience.url_img && (
                    <div className="w-full lg:w-[50%] lg:min-w-[400px]">
                      {getYouTubeId(experience.url_img) ? (
                        // Si l'URL est une vidéo YouTube
                        <iframe
                          className="w-full h-full rounded-lg aspect-video"
                          src={`https://www.youtube.com/embed/${getYouTubeId(
                            experience.url_img
                          )}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        // Si l'URL est une image, utiliser le composant Image de Next.js
                        <Image
                          src={experience.url_img}
                          alt="Image de l'expérience"
                          width={1280} // largeur de l'image
                          height={720} // hauteur de l'image
                          className="w-full max-h-full object-cover rounded-lg aspect-video"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
