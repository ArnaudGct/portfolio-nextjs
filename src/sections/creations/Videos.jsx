"use client";
import { useEffect, useState } from "react";
import Video from "./../../components/Video";
import TagCheckbox from "./../../components/TagCheckbox";
import FilterTag from "./../../components/FilterTag";
import { motion, AnimatePresence } from "motion/react";
import NumberFlow from "@number-flow/react";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setselectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true); // ⬅️ début du chargement

        const res = await fetch("/api/creations/videos");
        const data = await res.json();

        setVideos(data);
        setFilteredVideos(data);

        const uniqueTags = extractUniqueTags(data);
        setAllTags(uniqueTags);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des vidéos :", error);
      } finally {
        setIsLoading(false); // ⬅️ fin du chargement
      }
    };

    fetchVideos();
  }, []);

  const extractUniqueTags = (videoData) => {
    const tagSet = new Set();

    videoData.forEach((video) => {
      video.tags.forEach((tag) => {
        if (tag) tagSet.add(tag);
      });
    });

    return Array.from(tagSet).sort();
  };

  useEffect(() => {
    let result = [...videos];

    if (selectedTags.length > 0) {
      result = result.filter((video) => {
        return selectedTags.every((tag) => video.tags.includes(tag));
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
  }, [videos, selectedTags, searchQuery]);

  const toggleTag = (tag) => {
    setselectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
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
    <div className="flex flex-col gap-8 md:gap-12 w-full">
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
            {allTags.map((type) => (
              <TagCheckbox
                key={type}
                type={type}
                selected={selectedTags.includes(type)}
                onToggle={toggleTag}
              />
            ))}
          </div>

          {(selectedTags.length > 0 || searchQuery) && (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {(selectedTags.length > 0 || searchQuery) && (
                  <FilterTag
                    key="clear"
                    label="Effacer tous les filtres"
                    color="red"
                    isClearAll
                    onRemove={() => {
                      setselectedTags([]);
                      setSearchQuery("");
                    }}
                  />
                )}
                {selectedTags.map((type) => (
                  <FilterTag
                    key={type}
                    label={type}
                    color="green"
                    onRemove={() => toggleTag(type)}
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
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredVideos.length > 0 ? (
          <AnimatePresence>
            <motion.div
              key={filteredVideos.length}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-10"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.1 },
                },
                hidden: {},
              }}
            >
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id_crea}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9, y: 20 },
                    visible: { opacity: 1, scale: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Video
                    id={video.id_crea}
                    title={video.titre}
                    url={video.lien}
                    tags={video.tags}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
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
  );
}
