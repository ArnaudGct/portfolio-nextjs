"use client";
import { useEffect, useState } from "react";
import AutreItem from "./AutreItem";
import TagCheckbox from "./../../../components/TagCheckbox";
import FilterTag from "./../../../components/FilterTag";
import { motion, AnimatePresence } from "motion/react";
import NumberFlow from "@number-flow/react";

export default function Autre() {
  const [autres, setAutres] = useState([]);
  const [filteredAutres, setFilteredAutres] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVisuallyLoading, setIsVisuallyLoading] = useState(true);

  // Helper function to ensure a value is an array
  const ensureArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return [value];
  };

  // Helper function to normalize tag objects
  const normalizeTag = (tag) => {
    if (typeof tag === "string") {
      return { titre: tag, important: false };
    }
    if (typeof tag === "object" && tag !== null) {
      return {
        titre: tag.titre || String(tag),
        important: !!tag.important,
      };
    }
    return { titre: String(tag), important: false };
  };

  useEffect(() => {
    const fetchAutres = async () => {
      try {
        setIsLoading(true);
        setIsVisuallyLoading(true);

        const res = await fetch("/api/creations/autre");
        const data = await res.json();

        // Clean and normalize data
        const processedData = data.map((item, index) => {
          // Process tags to ensure they're objects with titre and important properties
          const processedTags = ensureArray(item.tags).map(normalizeTag);

          return {
            ...item,
            id_autre: item.id_autre || `autre-${index}`,
            // Keep titre as is if it's a string, otherwise convert to string
            titre:
              typeof item.titre === "string"
                ? item.titre
                : item.titre && item.titre.titre
                  ? item.titre.titre
                  : String(item.titre),
            tags: processedTags,
          };
        });

        setAutres(processedData);
        setFilteredAutres(processedData);

        const uniqueTags = extractUniqueTags(processedData);
        setAllTags(uniqueTags);

        // Marquer que le chargement réel est terminé
        setIsLoading(false);

        // Imposer un délai minimum pour l'affichage du skeleton
        const minLoadingTime = 300; // 600ms minimum
        setTimeout(() => {
          setIsVisuallyLoading(false);
        }, minLoadingTime);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des autres créations :",
          error
        );
        setIsLoading(false);
        setIsVisuallyLoading(false);
      }
    };

    fetchAutres();
  }, []);

  const extractUniqueTags = (autreData) => {
    const tagSet = new Set();

    autreData.forEach((autre) => {
      if (Array.isArray(autre.tags)) {
        autre.tags.forEach((tag) => {
          if (tag && tag.titre) tagSet.add(tag.titre);
        });
      }
    });

    return Array.from(tagSet).sort();
  };

  useEffect(() => {
    let result = [...autres];

    if (selectedTags.length > 0) {
      result = result.filter((autre) => {
        return selectedTags.every(
          (selectedTag) =>
            Array.isArray(autre.tags) &&
            autre.tags.some((tag) => tag.titre === selectedTag)
        );
      });
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (autre) =>
          (typeof autre.titre === "string" &&
            autre.titre.toLowerCase().includes(query)) ||
          (autre.description &&
            typeof autre.description === "string" &&
            autre.description.toLowerCase().includes(query))
      );
    }

    setFilteredAutres(result);
  }, [autres, selectedTags, searchQuery]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getLastAddedDays = () => {
    if (!autres || autres.length === 0) return "Aucune autre création";

    const dates = autres
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

    return `${timeText} depuis la modification d'une autre création`;
  };

  return (
    <div className="flex flex-col gap-8 md:gap-12 w-full">
      <div className="flex flex-col gap-8 md:gap-4">
        <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center">
          <div className="flex flex-col">
            {isVisuallyLoading ? (
              <>
                <div className="h-8 w-48 bg-blue-100/40 rounded-md mb-2"></div>
                <div className="h-6 w-72 bg-blue-100/40 rounded-md"></div>
              </>
            ) : (
              <>
                <p className="text-2xl font-extrabold font-rethink-sans text-blue-600">
                  <NumberFlow value={filteredAutres.length} /> autre
                  {filteredAutres.length > 1 ? "s" : ""} création
                  {filteredAutres.length > 1 ? "s" : ""} disponible
                  {filteredAutres.length > 1 ? "s" : ""}
                </p>
                <p className="text-lg text-blue-900">{getLastAddedDays()}</p>
              </>
            )}
          </div>
          <div className="w-full md:w-auto relative">
            <div className="flex">
              <input
                type="text"
                placeholder="Rechercher une création..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 bg-slate-200 dark:bg-blue-50 dark:text-blue-950 dark:placeholder:text-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 md:w-64 lg:w-96"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <TagCheckbox
                key={tag}
                type={tag}
                selected={selectedTags.includes(tag)}
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
                      setSelectedTags([]);
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
            {/* Génération de 6 cartes squelettes pour les autres créations */}
            {[...Array(6)].map((_, index) => (
              <div
                key={`autre-skeleton-${index}`}
                className="rounded-lg overflow-hidden"
              >
                <div className="flex flex-col gap-4">
                  <div className="relative w-full h-48 bg-blue-100/40 rounded-lg"></div>
                  <div className="w-full flex flex-col gap-3">
                    <div className="w-3/4 h-6 bg-blue-100/40 rounded-md"></div>
                    <div className="flex gap-2 mt-1">
                      <div className="w-16 h-5 bg-blue-100/40 rounded-full"></div>
                      <div className="w-20 h-5 bg-blue-100/40 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : filteredAutres.length > 0 ? (
          <AnimatePresence>
            <motion.div
              key={filteredAutres.length}
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
              {filteredAutres.map((autre) => {
                return (
                  <motion.div
                    key={autre.id_autre}
                    variants={{
                      hidden: { opacity: 0, scale: 0.9, y: 20 },
                      visible: { opacity: 1, scale: 1, y: 0 },
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <AutreItem
                      id={autre.id_autre}
                      title={autre.titre}
                      miniature={autre.miniature || "#"}
                      tags={autre.tags}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <p className="text-xl font-rethink-sans text-blue-600 font-bold">
              Oh non ! Aucune autre création ne correspond à vos critères 😭
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
