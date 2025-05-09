"use client";
import { useState, useEffect } from "react";
import TagRadio from "./../../src/components/TagRadio";
import Videos from "../../src/sections/creations/Videos/Videos";
import Photos from "../../src/sections/creations/Photos/Photos";
import Autre from "../../src/sections/creations/Autre/Autre";

export default function Creations() {
  // Utiliser un état pour suivre si le composant est monté côté client
  const [isClient, setIsClient] = useState(false);

  // État pour le type sélectionné avec une valeur par défaut
  const [selectedType, setSelectedType] = useState("Vidéos");

  // Vérifier si on est côté client au chargement du composant
  useEffect(() => {
    setIsClient(true);

    // Récupérer la valeur depuis localStorage
    const savedType = localStorage.getItem("selectedType");
    if (savedType) {
      setSelectedType(savedType);
    }
  }, []);

  // Mettre à jour localStorage lorsque l'état change
  // Exécuté uniquement après le premier rendu quand isClient est true
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("selectedType", selectedType);
    }
  }, [selectedType, isClient]);

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
              onToggle={setSelectedType}
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
