"use client";
import { useEffect, useState, useCallback, useRef } from "react";
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
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  const maxRetries = 2; // Réduit encore plus pour éviter les délais

  // Fonction de fetch optimisée avec timeout plus court
  const fetchMovieData = useCallback(
    async (isRetry = false) => {
      try {
        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Créer un nouveau contrôleur pour cette requête
        abortControllerRef.current = new AbortController();

        // Toujours afficher le loading au début, sauf si on a déjà des données et que c'est un retry
        if (!isRetry || !movieData) {
          setLoading(true);
        }
        setError(null);

        // Générer un ID unique pour éviter le cache
        const uniqueId = `${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Timeout réduit à 8 secondes pour la première requête, 5 pour les retry
        const timeoutDuration = isRetry ? 5000 : 8000;
        const timeoutId = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        }, timeoutDuration);

        console.log("🎬 Début de la requête Letterboxd...");
        const startTime = Date.now();

        const response = await fetch(
          `/api/extern/letterboxd?bust=${uniqueId}`,
          {
            method: "GET",
            cache: "no-store",
            signal: abortControllerRef.current.signal,
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );

        clearTimeout(timeoutId);

        const endTime = Date.now();
        console.log(
          `✅ Requête Letterboxd terminée en ${endTime - startTime}ms`
        );

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Vérifier que les données sont valides
        if (!data || typeof data !== "object") {
          throw new Error("Données invalides reçues de l'API");
        }

        setMovieData(data);
        setError(null);
        setRetryCount(0);
        setLoading(false);

        // Nettoyer le timeout de retry s'il existe
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      } catch (error) {
        // Ne pas traiter les erreurs d'annulation
        if (error.name === "AbortError") {
          console.log("⏹️ Requête annulée");
          return;
        }

        console.error("❌ Erreur lors de la récupération des données:", error);

        // Gestion des erreurs avec retry automatique plus rapide
        setRetryCount((prevCount) => {
          const newCount = prevCount + 1;

          if (newCount <= maxRetries) {
            console.log(
              `🔄 Tentative ${newCount}/${maxRetries} après erreur:`,
              error.message
            );

            // Délai progressif plus court : 300ms, 600ms
            const retryDelay = 300 * newCount;

            retryTimeoutRef.current = setTimeout(() => {
              fetchMovieData(true);
            }, retryDelay);

            return newCount;
          }

          // Si on a épuisé les tentatives
          setError(error.message || "Erreur inconnue");
          setLoading(false);
          return newCount;
        });
      }
    },
    [] // Pas de dépendances pour éviter les re-renders infinis
  );

  // Fonction pour forcer le rechargement
  const forceReload = useCallback(() => {
    // Nettoyer les timeouts existants
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Annuler la requête en cours si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setRetryCount(0);
    setError(null);
    setMovieData(null);
    setLoading(true);
    fetchMovieData(false);
  }, [fetchMovieData]);

  // useEffect qui ne s'exécute qu'une seule fois au montage
  useEffect(() => {
    // Reset du flag lors du montage
    isInitialMount.current = false;

    // Démarrer le fetch immédiatement
    fetchMovieData(false);

    // Cleanup : annuler la requête et les timeouts si le composant est démonté
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, []); // Tableau de dépendances vide = exécution une seule fois

  // État de chargement - pendant le chargement initial ou les retries
  if (loading) {
    return (
      <div className="h-24">
        <MediaCard
          imageComponent={<SpinnerLoader />}
          imageType="custom"
          labelText="Chargement..."
          titleText={
            retryCount > 0
              ? `Tentative ${retryCount}/${maxRetries}`
              : "En cours..."
          }
          subtitleText="Letterboxd"
          {...SKELETON_COLORS}
          logoSrc="/letterboxd.webp"
          logoAlt="Logo de Letterboxd"
        />
      </div>
    );
  }

  // État d'erreur - seulement si on a vraiment une erreur ET qu'on n'est pas en train de charger
  if (error && !loading) {
    return (
      <div className="h-24">
        <MediaCard
          imageComponent={<ErrorPlaceholder />}
          imageType="custom"
          labelText="Indisponible"
          titleText="Letterboxd"
          subtitleText={`Échec après ${retryCount} tentatives`}
          {...ERROR_COLORS}
          logoSrc="/letterboxd.webp"
          logoAlt="Logo de Letterboxd"
          onClick={forceReload}
        />
      </div>
    );
  }

  // Si on n'a pas de données et qu'on n'est pas en train de charger, afficher le skeleton
  if (!movieData && !loading) {
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
