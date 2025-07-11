"use client";

import Image from "next/image";
import ButtonMain from "./../../src/components/ButtonMain";
import { ArrowUpRight, Cake, Loader2 } from "lucide-react";
import Tag from "./../../src/components/Tag";
import TagAvailable from "./../../src/components/TagAvailable";
import MediaCard from "./../../src/components/MediaCard";
import TagUtilities from "./../../src/components/TagUtilities";
import SpotifyMediaCard from "./../../src/components/SpotifyMediaCard";
import LetterboxdMediaCard from "./../../src/components/LetterboxdMediaCard";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";

export default function APropos() {
  const [aproposData, setAproposData] = useState(null);
  const [outilsData, setOutilsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aproposResponse, outilsResponse] = await Promise.all([
          fetch("/api/a-propos/general"),
          fetch("/api/a-propos/outils"),
        ]);

        const aproposData = await aproposResponse.json();
        const outilsData = await outilsResponse.json();

        setAproposData(aproposData);
        setOutilsData(outilsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Composant personnalisé pour les liens
  const CustomLink = ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 underline hover:text-blue-600 transition-colors"
      {...props}
    >
      {children}
    </a>
  );

  // Composant Skeleton pour le texte
  const TextSkeleton = ({ className = "", width = "100%" }) => (
    <div
      className={`animate-pulse bg-blue-100  rounded ${className}`}
      style={{ width }}
    ></div>
  );

  if (loading) {
    return (
      <main className="bg-white">
        <div className="pt-24 pb-20">
          <div className="max-w-[1440px] mx-auto w-[90%]">
            <div className="grid grid-cols-1 md:grid-cols-2 md:order-2 lg:grid-cols-[auto_1fr] gap-6 sm:gap-10">
              {/* Section "Qui suis-je?" - Skeleton */}
              <div className="flex flex-col gap-4 bg-white rounded-lg order-1 lg:order-2 lg:col-start-2">
                <TextSkeleton className="h-8" width="200px" />
                <div className="space-y-3">
                  <TextSkeleton className="h-4" width="100%" />
                  <TextSkeleton className="h-4" width="95%" />
                  <TextSkeleton className="h-4" width="90%" />
                  <TextSkeleton className="h-4" width="85%" />
                  <TextSkeleton className="h-4" width="80%" />
                </div>
              </div>

              {/* Colonne de gauche - Skeleton */}
              <div className="flex flex-col gap-4 mx-auto lg:mx-0 w-full lg:max-w-72 order-2 md:order-1 lg:order-1 lg:col-start-1 lg:row-span-3 lg:sticky lg:top-24 lg:self-start">
                <div className="flex flex-col rounded-lg">
                  <div className="relative flex items-stretch h-[450px] md:h-[300px] lg:h-[350px] w-full">
                    <div className="w-full h-full bg-blue-100 rounded-t-lg animate-pulse flex items-center justify-center">
                      <Loader2
                        size={48}
                        className="text-blue-400 animate-spin"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 p-5 bg-blue-50 rounded-b-lg">
                    <div className="flex flex-col items-start justify-start">
                      <TextSkeleton className="h-6 mb-2" width="80px" />
                      <TextSkeleton className="h-12 mb-4" width="150px" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <TextSkeleton
                        className="h-8 rounded-full"
                        width="120px"
                      />
                      <TextSkeleton className="h-8 rounded-full" width="80px" />
                    </div>
                  </div>
                </div>
                <TextSkeleton className="h-12 rounded-lg" width="150px" />
              </div>

              {/* Section des cartes media - Skeleton */}
              <div className="order-3 lg:order-3 lg:col-start-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                  <TextSkeleton className="h-56 rounded-lg" width="100%" />
                  <div className="flex flex-col gap-4">
                    <TextSkeleton className="h-24 rounded-lg" width="100%" />
                    <TextSkeleton className="h-24 rounded-lg" width="100%" />
                  </div>
                </div>
              </div>

              {/* Section outils - Skeleton */}
              <div className="flex flex-col gap-6 rounded-lg p-6 bg-blue-50 order-4 lg:order-4 lg:col-start-2">
                <TextSkeleton className="h-8" width="250px" />
                <div className="flex flex-wrap gap-4">
                  {[...Array(7)].map((_, i) => (
                    <TextSkeleton
                      key={i}
                      className="h-16 rounded-lg"
                      width="150px"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-t from-blue-100/0 to-blue-100/75 pointer-events-none"></div>
      </main>
    );
  }

  if (!aproposData) {
    return (
      <main className="bg-white">
        <div className="pt-24 pb-20">
          <div className="max-w-[1440px] mx-auto w-[90%]">
            <div className="text-center p-8">
              Erreur lors du chargement des données
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <div className="pt-24 pb-20">
        <div className="max-w-[1440px] mx-auto w-[90%]">
          {/* Conteneur principal - change l'ordre en responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:order-2 lg:grid-cols-[auto_1fr] gap-6 sm:gap-10">
            {/* Section "Qui suis-je?" - apparaît en premier sur mobile */}
            <div className="flex flex-col gap-4 bg-white rounded-lg order-1 lg:order-2 lg:col-start-2">
              <p className="text-blue-600 text-3xl font-extrabold font-rethink-sans">
                Qui suis-je ?
              </p>
              <div className="text-blue-900 text-base/8 font-normal">
                <ReactMarkdown
                  components={{
                    a: CustomLink,
                    p: ({ children }) => (
                      <p className="mb-4 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-blue-600 font-normal">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {aproposData.description}
                </ReactMarkdown>
              </div>
            </div>

            {/* Colonne de gauche - carte d'identité - apparaît en deuxième sur mobile */}
            <div className="flex flex-col gap-4 mx-auto lg:mx-0 w-full lg:max-w-72 order-2 md:order-1 lg:order-1 lg:col-start-1 lg:row-span-3 lg:sticky lg:top-24 lg:self-start">
              <div className="flex flex-col rounded-lg">
                <div className="relative flex items-stretch h-[450px] md:h-[300px] lg:h-[350px] w-full">
                  {/* Spinner pendant le chargement de l'image */}
                  {imageLoading && (
                    <div className="absolute inset-0 bg-blue-100 rounded-t-lg flex items-center justify-center z-10">
                      <Loader2
                        size={48}
                        className="text-blue-400 animate-spin"
                      />
                    </div>
                  )}

                  <Image
                    src={aproposData.photo}
                    alt={aproposData.photo_alt}
                    fill
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    priority={false}
                    sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 288px"
                    className="object-cover object-[50%_30%]  lg:object-[50%_15%] rounded-t-lg border-x border-t border-blue-300"
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />

                  {/* Crédit photo */}
                  <Link
                    href={aproposData.credit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="absolute bottom-2 left-2 bg-blue-900/50 px-2 py-1 rounded text-xs text-white backdrop-blur-xs">
                      <p>📸 {aproposData.credit_nom}</p>
                    </div>
                  </Link>
                </div>
                <div className="flex flex-col gap-4 p-5 bg-blue-50 rounded-b-lg border-x border-b border-blue-300">
                  <div className="flex flex-col items-start justify-start">
                    <p className="text-blue-400 text-xl font-normal font-rethink-sans">
                      Arnaud
                    </p>
                    <p className="text-blue-700 text-5xl font-extrabold font-rethink-sans">
                      Graciet
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TagAvailable href="https://cal.com/arnaudgct/prise-de-contact" />
                    <Tag
                      name="21 ans"
                      background={true}
                      icon={<Cake size={14} strokeWidth={1.75} />}
                    />
                  </div>
                </div>
              </div>
              <ButtonMain
                icon={<ArrowUpRight size={16} />}
                link="/journal-personnel"
                newTab={false}
                size="base"
                className="w-full xs:w-auto"
              >
                Journal personnel
              </ButtonMain>
            </div>

            {/* Section des cartes media - apparaît en troisième sur mobile */}
            <div className="order-3 lg:order-3 lg:col-start-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                {/* MAP */}
                <Link
                  href="https://maps.apple.com/place?z=15&auid=6034166720712255280&address=17000+La+Rochelle%2C+France&coordinate=46.1622489%2C-1.1550672&name=La+Rochelle&lsp=6489"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden w-full h-56 sm:h-full md:h-56 lg:h-full rounded-lg border border-blue-300 transition-shadow duration-300 ease-in-out hover:shadow-lg"
                >
                  <div className="relative w-full h-full">
                    {/* Spinner pendant le chargement de la carte */}
                    {mapLoading && (
                      <div className="absolute inset-0 bg-blue-100 rounded-lg flex items-center justify-center z-10">
                        <Loader2
                          size={48}
                          className="text-blue-400 animate-spin"
                        />
                      </div>
                    )}

                    <Image
                      src="https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/-1.1519041,46.1568242,12/700x500?access_token=pk.eyJ1IjoibGFyZWZhc3RybyIsImEiOiJjbTlpejFibDcwNXpxMmtzYmZxdW1nODk0In0.AHV1GODjHroWMOUaWaIwmQ"
                      alt="Carte de La Rochelle"
                      fill
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      priority={false}
                      sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, 33vw"
                      className="object-cover object-center rounded-lg transition-transform duration-500 ease-in-out group-hover:scale-105"
                      onLoad={() => setMapLoading(false)}
                      onError={() => setMapLoading(false)}
                    />
                  </div>
                  <div className="absolute bottom-2 left-4 flex flex-col items-start z-10">
                    <p className="text-sm text-blue-300 dark:text-blue-200 font-rethink-sans">
                      J'habite à
                    </p>
                    <p className="text-blue-50 font-bold text-lg font-rethink-sans">
                      La Rochelle
                    </p>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#4e4aec]/0 to-[#4e4aec] z-5"></div>
                </Link>
                {/* MediaCards */}
                <div className="flex flex-col gap-4">
                  <SpotifyMediaCard />
                  <LetterboxdMediaCard />
                </div>
              </div>
            </div>

            {/* Section "Avec quoi je travaille" - apparaît en quatrième sur mobile */}
            <div className="flex flex-col gap-6 border border-slate-300 rounded-lg p-6 bg-slate-50 order-4 lg:order-4 lg:col-start-2">
              <div className="flex flex-col gap-1">
                <p className="text-slate-900 text-2xl font-extrabold font-rethink-sans">
                  Avec quoi je travaille ?
                </p>
                <p className="text-slate-400 text-base/7 font-normal">
                  Les outils de post-production et d'organisation me permettant
                  de travailler de façon créative et efficace.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 items-center justify-start">
                {outilsData.map((outil) => (
                  <TagUtilities
                    key={outil.id_outil}
                    logoSrc={outil.icone}
                    logoAlt={outil.icone_alt}
                    label={outil.titre}
                    description={outil.description}
                    bgColor={outil.couleur_fond}
                    bgColorDark={outil.couleur_fond_dark}
                    borderColor={outil.couleur_contour}
                    borderColorDark={outil.couleur_contour_dark}
                    textColor={outil.couleur_texte}
                    textColorDark={outil.couleur_texte_dark}
                    rounded={outil.icone_rounded}
                    link={outil.lien}
                    newTab={true}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-t from-blue-100/0 to-blue-100/75 pointer-events-none"></div>
    </main>
  );
}
