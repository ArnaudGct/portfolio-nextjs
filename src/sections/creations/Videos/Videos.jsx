"use client";
import { useEffect, useState } from "react";
import VideoItem from "./VideoItem";
import TagCheckbox from "../../../components/TagCheckbox";
import FilterTag from "../../../components/FilterTag";
import { motion, AnimatePresence } from "motion/react";
import NumberFlow from "@number-flow/react";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setselectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVisuallyLoading, setIsVisuallyLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        setIsVisuallyLoading(true);

        const res = await fetch("/api/creations/videos");
        const data = await res.json();

        setVideos(data);
        setFilteredVideos(data);

        const uniqueTags = extractUniqueTags(data);
        setAllTags(uniqueTags);

        // Marquer que le chargement réel est terminé
        setIsLoading(false);

        // Imposer un délai minimum pour l'affichage du skeleton
        const minLoadingTime = 300; // 600ms minimum
        setTimeout(() => {
          setIsVisuallyLoading(false);
        }, minLoadingTime);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des vidéos :", error);
        setIsLoading(false);
        setIsVisuallyLoading(false);
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
    const now = new Date();
    const diffMs = now.getTime() - latestDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeText = "";
    if (diffMinutes < 60) {
      timeText = `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
    } else if (diffHours < 24) {
      timeText = `${diffHours} heure${diffHours > 1 ? "s" : ""}`;
    } else {
      timeText = `${diffDays} jour${diffDays > 1 ? "s" : ""}`;
    }

    return `${timeText} depuis l'ajout d'une vidéo`;
  };

  return (
    <div className="flex flex-col gap-8 md:gap-12 w-full">
      <div className="flex flex-col gap-6 md:gap-4">
        <div className="flex flex-col gap-6 md:gap-4 md:flex-row justify-between items-start md:items-center">
          <div className="flex flex-col gap-1 md:gap-0">
            {isVisuallyLoading ? (
              <>
                <div className="h-8 w-48 bg-blue-100/40 rounded-md mb-2"></div>
                <div className="h-6 w-72 bg-blue-100/40 rounded-md"></div>
              </>
            ) : (
              <>
                <p className="text-2xl font-extrabold font-rethink-sans text-blue-600">
                  <NumberFlow value={filteredVideos.length} /> vidéo
                  {filteredVideos.length > 1 ? "s" : ""} disponible
                  {filteredVideos.length > 1 ? "s" : ""}
                </p>
                <p className="text-lg text-blue-900">{getLastAddedDays()}</p>
              </>
            )}
          </div>
          <div className="w-full md:w-auto relative">
            <div className="flex">
              <input
                type="text"
                placeholder="Rechercher une vidéo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 bg-slate-200 dark:bg-blue-50 dark:text-blue-950 dark:placeholder:text-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 md:w-64 lg:w-96"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {allTags.map((type) => {
              const count = videos.filter((video) =>
                video.tags.includes(type)
              ).length;
              return (
                <TagCheckbox
                  key={type}
                  type={type}
                  count={count}
                  selected={selectedTags.includes(type)}
                  onToggle={toggleTag}
                />
              );
            })}
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
        {isVisuallyLoading ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-10"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {/* Génération de 6 cartes squelettes pour les vidéos */}
            {[...Array(6)].map((_, index) => (
              <div
                key={`video-skeleton-${index}`}
                className="rounded-lg overflow-hidden"
              >
                <div className="flex flex-col gap-4">
                  {/* Placeholder pour la miniature vidéo (ratio 16:9) */}
                  <div className="relative w-full aspect-video bg-blue-100/40 rounded-lg">
                    {/* Icône de lecture au centre */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-blue-200/50"></div>
                    </div>
                  </div>
                  <div className="w-full flex flex-col gap-3">
                    {/* Placeholder pour le titre */}
                    <div className="w-3/4 h-6 bg-blue-100/40 rounded-md"></div>
                    {/* Placeholders pour les tags */}
                    <div className="flex gap-2 mt-1">
                      <div className="w-16 h-5 bg-blue-100/40 rounded-full"></div>
                      <div className="w-20 h-5 bg-blue-100/40 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
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
                  key={video.id_vid}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9, y: 20 },
                    visible: { opacity: 1, scale: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <VideoItem
                    id={video.id_vid}
                    title={video.titre}
                    url={video.lien}
                    tags={video.tags}
                    pageCurrent="creations"
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
