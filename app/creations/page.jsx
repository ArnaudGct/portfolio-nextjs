"use client";
import { useEffect, useState } from "react";
import Video from "./../../src/components/Video";
import TagCheckbox from "./../../src/components/TagCheckbox";
import FilterTag from "./../../src/components/FilterTag";
import { X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import NumberFlow from "@number-flow/react";

export default function Creations() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/creations/videos");
        const data = await res.json();

        const cleanedData = data.map((video) => {
          let cleanedTypes = [];

          if (typeof video.type === "string") {
            cleanedTypes = video.type
              .split(",")
              .map((type) => type.trim())
              .filter((type) => type.length > 0);
          } else if (Array.isArray(video.type)) {
            cleanedTypes = video.type
              .flatMap((type) => type.split(","))
              .map((type) => type.trim())
              .filter(Boolean);
          }

          return {
            ...video,
            type: cleanedTypes,
          };
        });

        setVideos(cleanedData);
        setFilteredVideos(cleanedData);

        const uniqueTypes = extractUniqueTypes(cleanedData);
        setAllTypes(uniqueTypes);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des vidéos :", error);
      }
    };
    fetchVideos();
  }, []);

  const extractUniqueTypes = (videoData) => {
    const typeSet = new Set();

    videoData.forEach((video) => {
      video.type.forEach((type) => {
        if (type) typeSet.add(type);
      });
    });

    return Array.from(typeSet).sort();
  };

  useEffect(() => {
    let result = [...videos];

    if (selectedTypes.length > 0) {
      result = result.filter((video) => {
        return selectedTypes.every((tag) => video.type.includes(tag));
      });
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (video) =>
          video.titre.toLowerCase().includes(query) ||
          (video.description && video.description.toLowerCase().includes(query))
      );
    }

    setFilteredVideos(result);
  }, [videos, selectedTypes, searchQuery]);

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const getLastAddedDays = () => {
    if (!videos || videos.length === 0) return "Aucune vidéo";

    const dates = videos
      .map((v) =>
        v.derniere_modification ? new Date(v.derniere_modification) : null
      )
      .filter(Boolean);

    if (dates.length === 0) return "Date inconnue";

    const latestDate = new Date(Math.max(...dates));
    const diffTime = Math.abs(new Date() - latestDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${diffDays} jour${
      diffDays > 1 ? "s" : ""
    } depuis l'ajout d'une vidéo`;
  };

  return (
    <main className="">
      <div className="flex flex-col gap-8 md:gap-12 w-[90%] mt-24 mb-20 mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-8 md:gap-4">
          <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center">
            <div className="flex flex-col">
              <p className="text-2xl font-extrabold font-rethink-sans text-blue-600">
                <NumberFlow value={filteredVideos.length} /> vidéo
                {filteredVideos.length > 1 ? "s" : ""} disponible
                {filteredVideos.length > 1 ? "s" : ""}
              </p>
              <p className="text-lg text-blue-900">{getLastAddedDays()}</p>
            </div>
            <div className="w-full md:w-auto relative">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Rechercher une vidéo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 px-4 bg-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 md:w-64 lg:w-96"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {allTypes.map((type) => (
                <TagCheckbox
                  key={type}
                  type={type}
                  selected={selectedTypes.includes(type)}
                  onToggle={toggleType}
                />
              ))}
            </div>

            {(selectedTypes.length > 0 || searchQuery) && (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {(selectedTypes.length > 0 || searchQuery) && (
                    <FilterTag
                      key="clear"
                      label="Effacer tous les filtres"
                      color="red"
                      isClearAll
                      onRemove={() => {
                        setSelectedTypes([]);
                        setSearchQuery("");
                      }}
                    />
                  )}
                  {selectedTypes.map((type) => (
                    <FilterTag
                      key={type}
                      label={type}
                      color="green"
                      onRemove={() => toggleType(type)}
                    />
                  ))}

                  {searchQuery && (
                    <FilterTag
                      key="search"
                      label={`Recherche: ${searchQuery}`}
                      color="yellow"
                      onRemove={() => setSearchQuery("")}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div className="min-h-[calc(100vh-296px)]">
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-10">
              {filteredVideos.map((video) => (
                <Video
                  key={video.id_crea}
                  id={video.id_crea}
                  title={video.titre}
                  url={video.lien}
                  types={video.type}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <p className="text-xl font-rethink-sans text-blue-600 font-bold">
                Oh non ! Aucune vidéo ne correspond à vos critères 😭
              </p>
              <p className="text-base text-blue-900">
                Essayez de modifier vos filtres ou votre recherche 🔍
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-t from-[#dfe7ff]/0 to-[#dfe7ff]/75 pointer-events-none"></div>
    </main>
  );
}
