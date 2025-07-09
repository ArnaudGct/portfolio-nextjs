"use client";

import Image from "next/image";
import Tag from "./../../components/Tag";
import TagAvailable from "./../../components/TagAvailable";
import { Cake, MapPin, Loader2 } from "lucide-react";
import ButtonMain from "./../../components/ButtonMain";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";

export default function Presentation() {
  const [accueilData, setAccueilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const fetchAccueilData = async () => {
      try {
        const response = await fetch("/api/accueil/general");
        const data = await response.json();
        setAccueilData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccueilData();
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
      className={`animate-pulse bg-blue-100/40 rounded ${className}`}
      style={{ width }}
    ></div>
  );

  if (loading) {
    return (
      <section className="relative w-[90%] max-w-[1440px] mx-auto flex flex-col sm:flex-row gap-5 md:gap-8 items-start sm:items-center justify-center sm:justify-start">
        {/* Skeleton pour l'image */}
        <div className="relative flex items-stretch h-[500px] lg:h-[400px] w-full sm:w-[70%] lg:w-[50%] lg:max-w-[350px]">
          <div className="w-full h-full bg-blue-100  rounded-lg animate-pulse flex items-center justify-center">
            <Loader2 size={48} className="text-blue-400 animate-spin" />
          </div>
        </div>

        {/* Skeleton pour le contenu texte */}
        <div className="flex flex-col gap-7 items-start w-full z-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col items-start justify-start">
              <TextSkeleton className="h-6 mb-2" width="80px" />
              <TextSkeleton className="h-12 mb-4" width="150px" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TextSkeleton className="h-8 rounded-full" width="120px" />
              <TextSkeleton className="h-8 rounded-full" width="80px" />
              <TextSkeleton className="h-8 rounded-full" width="100px" />
              <TextSkeleton className="h-8 rounded-full" width="110px" />
              <TextSkeleton className="h-8 rounded-full" width="80px" />
            </div>
          </div>
          <div className="w-full">
            <TextSkeleton className="h-4 mb-3" width="100%" />
            <TextSkeleton className="h-4 mb-3" width="95%" />
            <TextSkeleton className="h-4 mb-3" width="90%" />
            <TextSkeleton className="h-4 mb-3" width="85%" />
            <TextSkeleton className="h-4 mb-3" width="80%" />
            <TextSkeleton className="h-4 mb-3" width="60%" />
          </div>
          <TextSkeleton className="h-12 rounded-lg" width="150px" />
        </div>

        {/* Gradient de fond */}
        <div className="w-72 h-72 right-0 bottom-0 sm:top-0 z-1 absolute rounded-full bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_var(--blue-200,_#C5D3FF)_0%,_rgba(197,_211,_255,_0)_100%)] dark:bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_var(--blue-900,_#1E3A8A)_0%,_rgba(30,_58,_138,_0)_100%)] opacity-40 dark:opacity-30"></div>
      </section>
    );
  }

  if (!accueilData) {
    return (
      <div className="text-center p-8">
        Erreur lors du chargement des données
      </div>
    );
  }

  return (
    <section className="relative w-[90%] max-w-[1440px] mx-auto flex flex-col sm:flex-row gap-5 md:gap-8 items-start sm:items-center justify-center sm:justify-start">
      <div className="relative flex items-stretch h-[500px] lg:h-[400px] w-full sm:w-[70%] lg:w-[50%] lg:max-w-[350px]">
        {/* Spinner pendant le chargement de l'image */}
        {imageLoading && (
          <div className="absolute inset-0 bg-blue-100 rounded-lg flex items-center justify-center z-10">
            <Loader2 size={48} className="text-blue-400 animate-spin" />
          </div>
        )}

        <Image
          src={accueilData.photo}
          alt={accueilData.photo_alt}
          fill
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          priority={false}
          className="object-cover object-[50%_15%] rounded-lg"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 350px"
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />

        <Link
          href={accueilData.credit_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="absolute bottom-2 left-2 bg-blue-900/50 px-2 py-1 rounded text-xs text-white backdrop-blur-xs">
            <p>📸 {accueilData.credit_nom}</p>
          </div>
        </Link>
      </div>
      <div className="flex flex-col gap-7 items-start w-full z-2">
        <div className="flex flex-col gap-2">
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
            <Tag
              name="La Rochelle"
              background={true}
              href="https://maps.apple.com/place?z=15&auid=6034166720712255280&address=17000+La+Rochelle%2C+France&coordinate=46.1622489%2C-1.1550672&name=La+Rochelle&lsp=6489"
              icon={<MapPin size={14} strokeWidth={1.75} />}
            />
            <Tag name="monteur vidéo" background={false} />
            <Tag name="cadreur" background={false} />
          </div>
        </div>
        <div className="text-blue-900 text-base/8 font-normal font-outfit">
          <ReactMarkdown
            components={{
              a: CustomLink,
              p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
              strong: ({ children }) => (
                <strong className="text-blue-600 font-normal">
                  {children}
                </strong>
              ),
            }}
          >
            {accueilData.description}
          </ReactMarkdown>
        </div>
        <ButtonMain
          link="/apropos"
          size="base"
          newTab={false}
          icon={false}
          className="w-full xs:w-auto"
        >
          En savoir plus
        </ButtonMain>
      </div>
      <div className="w-72 h-72 right-0 bottom-0 sm:top-0 z-1 absolute rounded-full bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_var(--blue-200,_#C5D3FF)_0%,_rgba(197,_211,_255,_0)_100%)] dark:bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_var(--blue-900,_#1E3A8A)_0%,_rgba(30,_58,_138,_0)_100%)] opacity-40 dark:opacity-30"></div>
    </section>
  );
}
