"use client";
import { useState, useEffect } from "react";
import TagRadio from "./../../src/components/TagRadio";
import Videos from "../../src/sections/creations/Videos/Videos";
import Photos from "../../src/sections/creations/Photos/Photos";
import Autre from "../../src/sections/creations/Autre/Autre";

export default function Creations() {
  // Récupérer l'état initial depuis localStorage, ou "Vidéos" si pas de valeur
  const [selectedType, setSelectedType] = useState(() => {
    const savedType = localStorage.getItem("selectedType");
    return savedType ? savedType : "Vidéos";
  });

  // Mettre à jour localStorage lorsque l'état change
  useEffect(() => {
    localStorage.setItem("selectedType", selectedType);
  }, [selectedType]);

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
    <main className="">
      <div className="flex flex-col gap-8 w-[90%] mt-24 mb-20 mx-auto max-w-[1440px]">
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
      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-t from-[#dfe7ff]/0 to-[#dfe7ff]/75 pointer-events-none"></div>
    </main>
  );
}
