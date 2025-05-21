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
  const [filmData, setFilmData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecentFilm() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/extern/letterboxd");

        if (!response.ok) {
          throw new Error("Échec de la récupération des données Letterboxd");
        }

        const data = await response.json();
        setFilmData(data);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentFilm();
  }, []);

  if (isLoading) {
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

  if (error || !filmData) {
    console.error("Erreur:", error);
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
  } = filmData;

  return (
    <div className="h-24">
      <MediaCard
        imageSrc={filmData.posterUrl}
        imageAlt={`Affiche du film ${filmData.title}`}
        imageType="poster"
        labelText="Le dernier film que j'ai vu"
        titleText={filmData.title}
        bgColor={bgColor}
        borderColor={borderColor}
        labelColor={labelColor}
        titleColor={titleColor}
        logoSrc="/letterboxd.webp"
        logoAlt="Logo de Letterboxd"
        link={filmData.letterboxdUrl}
        newTab={true}
      />
    </div>
  );
}
