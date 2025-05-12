"use client";
import { useState, useEffect } from "react";
import TagRadio from "./../../src/components/TagRadio";
import Videos from "../../src/sections/creations/Videos/Videos";
import Photos from "../../src/sections/creations/Photos/Photos";
import Autre from "../../src/sections/creations/Autre/Autre";

export default function Creations() {
  // État pour le type sélectionné avec une valeur par défaut
  const [selectedType, setSelectedType] = useState("Vidéos");
  // Utiliser un état pour suivre si le composant est monté côté client
  const [isClient, setIsClient] = useState(false);

  // Effectuer la récupération depuis localStorage une seule fois au montage
  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);

    try {
      // Récupérer la valeur depuis localStorage
      const savedType = localStorage.getItem("selectedType");
      // Ne mettre à jour l'état que si une valeur valide est trouvée
      if (savedType && ["Vidéos", "Photos", "Autre"].includes(savedType)) {
        setSelectedType(savedType);
      }
    } catch (error) {
      console.error("Erreur lors de l'accès au localStorage:", error);
    }
  }, []);

  // Fonction pour gérer le changement de type
  const handleTypeChange = (newType) => {
    setSelectedType(newType);

    try {
      // Sauvegarder dans localStorage uniquement quand l'utilisateur change activement le type
      localStorage.setItem("selectedType", newType);
    } catch (error) {
      console.error("Erreur lors de l'écriture dans localStorage:", error);
    }
  };

  // Rendre un placeholder pendant le chargement côté client
  if (!isClient) {
    return (
      <main className="bg-white">
        <div className="flex flex-col gap-8 w-[90%] pt-24 pb-20 mx-auto max-w-[1440px]">
          <div className="flex gap-4 flex-wrap">
            {/* Placeholders pour les boutons */}
            {["Vidéos", "Photos", "Autre"].map((type) => (
              <div
                key={type}
                className="h-10 w-28 bg-blue-100/40 rounded-full animate-pulse"
              ></div>
            ))}
          </div>
          {/* Placeholder pour le contenu */}
          <div className="min-h-[calc(100vh-296px)] w-full bg-blue-50/20 rounded-lg"></div>
        </div>
      </main>
    );
  }

  const renderContent = () => {
    switch (selectedType) {
      case "Photos":
        return <Photos />;
      case "Autre":
        return <Autre />;
      default:
        return <Videos />;
    }
  };

  return (
    <main className="bg-white">
      <div className="flex flex-col gap-8 w-[90%] pt-24 pb-20 mx-auto max-w-[1440px]">
        {/* BOUTONS RADIO */}
        <div className="flex gap-4 flex-wrap">
          {["Vidéos", "Photos", "Autre"].map((type) => (
            <TagRadio
              key={type}
              type={type}
              selected={selectedType === type}
              onToggle={handleTypeChange} // Utilisez la nouvelle fonction
            />
          ))}
        </div>

        {/* CONTENU DYNAMIQUE */}
        <div className="min-h-[calc(100vh-296px)]">{renderContent()}</div>
      </div>

      {/* Effet de fond */}
      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-t from-blue-100/0 to-blue-100/75 pointer-events-none"></div>
    </main>
  );
}
