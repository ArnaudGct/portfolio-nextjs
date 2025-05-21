"use client";
import CloudflarePlayer from "./../../components/CloudflarePlayer";
import Tag from "../../components/Tag";
import TagAvailable from "../../components/TagAvailable";
import { useState, useEffect, useRef } from "react"; // Importer les hooks

export default function Hero() {
  const infoBoxRef = useRef(null);
  const [infoBoxHeight, setInfoBoxHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Effet pour détecter la taille de l'écran (mobile/desktop)
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's 'sm' breakpoint is 640px
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Effet pour mesurer la hauteur de la div d'information
  useEffect(() => {
    const element = infoBoxRef.current;
    if (element) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setInfoBoxHeight(entry.target.offsetHeight);
        }
      });
      observer.observe(element);
      // Mesure initiale
      setInfoBoxHeight(element.offsetHeight);
      return () => observer.unobserve(element);
    }
  }, []); // Exécuter une fois après le montage initial

  // Calculer le style du conteneur vidéo
  const videoContainerStyle =
    isMobile && infoBoxHeight > 0
      ? {
          top: `${64 + infoBoxHeight}px`, // 64px (hauteur de la barre sup) + hauteur de infoBox
          height: `calc(100vh - ${64 + infoBoxHeight}px)`,
        }
      : {
          top: "64px", // Comportement par défaut pour desktop ou si hauteur non mesurée
          height: "calc(100vh - 64px)",
        };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Arrière-plan : fond blanc + grille */}
      <div className="absolute top-0 left-0 w-full z-12 h-14 bg-gradient-to-t from-blue-100/0 to-blue-100/75 pointer-events-none"></div>
      <div
        className="absolute inset-0 z-9 bg-repeat bg-white"
        style={{
          backgroundImage: "url('/grille.svg')",
        }}
      />

      {/* Div d'information textuelle */}
      <div
        ref={infoBoxRef} // Attacher la référence ici
        className="w-full sm:w-auto rounded-b-lg sm:rounded-br-lg sm:rounded-bl-none absolute top-[64px] left-0 bg-white z-11 px-6 sm:px-10 pb-4 pt-2 "
        style={{
          backgroundImage: "url('/grille.svg')",
          backgroundRepeat: "repeat",
          backgroundPosition: "0 -64px", // raccord parfait avec le fond
        }}
      >
        <div className="flex flex-col gap-2 items-start justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <TagAvailable />
            <Tag name="monteur vidéo" background={false} />
            <Tag name="cadreur" background={false} />
          </div>
          <div className="flex flex-col w-full">
            <h1 className="flex flex-col sm:flex-row sm:items-center sm:gap-x-3 max-w-[380px] sm:max-w-none text-4xl font-black text-blue-900 font-rethink-sans">
              Hey, je suis
              <div className="sm:hidden flex items-end gap-2 w-full">
                <span className="flex-grow h-px bg-blue-600"></span>
                <span className="whitespace-nowrap font-covered-by-your-grace font-normal text-blue-600">
                  Arnaud Graciet
                </span>
              </div>
              {/* Desktop layout avec le nom inline */}
              <span className="hidden sm:inline font-covered-by-your-grace font-normal text-blue-600">
                Arnaud Graciet
              </span>
            </h1>
            {/* ... reste du contenu de h1 et h2 ... */}
            <h2 className="text-lg font-normal text-blue-900">
              Imaginons ensemble votre{" "}
              <span className="font-semibold text-blue-600">
                prochaine vidéo
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* Vidéo */}
      <div
        className="absolute left-0 w-full z-10" // Les classes top et height sont gérées par le style dynamique
        style={videoContainerStyle}
      >
        <CloudflarePlayer />
      </div>
      {/* <div className="absolute left-0 top-[64px] w-full h-[calc(100vh-64px)] z-10">
        <VimeoPlayer />
      </div> */}
      <div
        className="w-full sm:w-auto rounded-b-lg sm:rounded-br-lg sm:rounded-bl-none absolute top-[64px] left-0 bg-white z-11 px-6 sm:px-10 pb-4 pt-2 "
        style={{
          backgroundImage: "url('/grille.svg')",
          backgroundRepeat: "repeat",
          backgroundPosition: "0 -64px", // raccord parfait avec le fond
        }}
      >
        <div className="flex flex-col gap-2 items-start justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <TagAvailable />
            <Tag name="monteur vidéo" background={false} />
            <Tag name="cadreur" background={false} />
          </div>
          <div className="flex flex-col w-full">
            <h1 className="flex flex-col sm:flex-row sm:items-center sm:gap-x-3 max-w-[380px] sm:max-w-none text-4xl font-black text-blue-900 font-rethink-sans">
              Hey, je suis
              <div className="sm:hidden flex items-end gap-2 w-full">
                <span className="flex-grow h-px bg-blue-600"></span>
                <span className="whitespace-nowrap font-covered-by-your-grace font-normal text-blue-600">
                  Arnaud Graciet
                </span>
              </div>
              {/* Desktop layout avec le nom inline */}
              <span className="hidden sm:inline font-covered-by-your-grace font-normal text-blue-600">
                Arnaud Graciet
              </span>
            </h1>

            <h2 className="text-lg font-normal text-blue-900">
              Imaginons ensemble votre{" "}
              <span className="font-semibold text-blue-600">
                prochaine vidéo
              </span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
