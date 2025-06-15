"use client";
import { useEffect, useState } from "react";
import MediaCard from "./MediaCard";
import { AlertCircle, Loader2 } from "lucide-react";

// Couleurs par défaut pour le contenu réel
const DEFAULT_COLORS = {
  bgColor: "#14181c", // Fond noir comme Letterboxd
  borderColor: "#ff8000", // Orange Letterboxd
  labelColor: "#ff9a3c", // Orange plus clair
  titleColor: "#ffffff", // Texte blanc
};

// Couleurs pour le skeleton de chargement
const SKELETON_COLORS = {
  bgColor: "#212121", // Gris foncé pour le fond
  borderColor: "#303030", // Gris légèrement plus clair pour la bordure
  labelColor: "#909090", // Gris moyen pour le texte secondaire
  titleColor: "#b3b3b3", // Gris clair pour le texte principal
};

// Couleurs pour l'état d'erreur
const ERROR_COLORS = {
  bgColor: "#3D1D1D", // Rouge très foncé et grisé
  borderColor: "#5A2828", // Rouge foncé grisé
  labelColor: "#9E7575", // Rouge moyen grisé
  titleColor: "#C5A4A4", // Rouge clair grisé
};

// Composant de spinner qui tourne pour le chargement avec Lucide
const SpinnerLoader = () => (
  <div className="w-full h-full bg-[#333333] flex items-center justify-center">
    <div className="relative flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#ff8000] animate-spin" />
    </div>
  </div>
);

// Composant placeholder d'erreur avec Lucide
const ErrorPlaceholder = () => (
  <div className="w-full h-full bg-[#333333] flex items-center justify-center">
    <AlertCircle className="w-8 h-8 text-[#9E7575]" />
  </div>
);

export default function LetterboxdMediaCard() {
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        // Ajouter timestamp pour éviter le cache
        const timestamp = Date.now();
        const response = await fetch(`/api/extern/letterboxd?t=${timestamp}`, {
          cache: "no-store", // Empêche Next.js de cacher
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMovieData(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, []);

  if (loading) {
    return (
      <div className="h-24">
        <MediaCard
          imageComponent={<SpinnerLoader />}
          imageType="custom"
          labelText="Chargement..."
          titleText="En cours..."
          subtitleText="Letterboxd"
          {...SKELETON_COLORS}
          logoSrc="/letterboxd.webp"
          logoAlt="Logo de Letterboxd"
        />
      </div>
    );
  }

  if (!movieData) {
    return (
      <div className="h-24">
        <MediaCard
          imageComponent={<ErrorPlaceholder />}
          imageType="custom"
          labelText="Indisponible"
          titleText="Letterboxd"
          subtitleText="Erreur de connexion"
          {...ERROR_COLORS}
          logoSrc="/letterboxd.webp"
          logoAlt="Logo de Letterboxd"
        />
      </div>
    );
  }

  // Extraire les couleurs du filmData ou utiliser les couleurs par défaut
  const {
    bgColor = DEFAULT_COLORS.bgColor,
    borderColor = DEFAULT_COLORS.borderColor,
    labelColor = DEFAULT_COLORS.labelColor,
    titleColor = DEFAULT_COLORS.titleColor,
  } = movieData;

  return (
    <div className="h-24">
      <MediaCard
        imageSrc={movieData.posterUrl}
        imageAlt={`Affiche du film ${movieData.title}`}
        imageType="poster"
        labelText="Le dernier film que j'ai vu"
        titleText={movieData.title}
        bgColor={bgColor}
        borderColor={borderColor}
        labelColor={labelColor}
        titleColor={titleColor}
        logoSrc="/letterboxd.webp"
        logoAlt="Logo de Letterboxd"
        link={movieData.letterboxdUrl}
        newTab={true}
      />
    </div>
  );
}
