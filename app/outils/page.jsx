"use client";
"use client";
import { useEffect, useState } from "react";
import OutilItem from "./../../src/sections/outils/OutilsItem";
import TagCheckbox from "./../../src/components/TagCheckbox";
import FilterTag from "./../../src/components/FilterTag";
import { motion, AnimatePresence } from "motion/react";
import NumberFlow from "@number-flow/react";

export default function Outils() {
  const [outils, setOutils] = useState([]);
  const [filteredOutils, setFilteredOutils] = useState([]);
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
    const fetchOutils = async () => {
      try {
        setIsLoading(true);
        setIsVisuallyLoading(true);

        const res = await fetch("/api/outils");
        const data = await res.json();

        // Clean and normalize data
        const processedData = data.map((item, index) => {
          // Process tags to ensure they're objects with titre and important properties
          const processedTags = ensureArray(item.tags).map(normalizeTag);

          return {
            ...item,
            id_outil: item.id_outil || `outil-${index}`,
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

        setOutils(processedData);
        setFilteredOutils(processedData);

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
        console.error("❌ Erreur lors de la récupération des outils :", error);
        setIsLoading(false);
        setIsVisuallyLoading(false);
      }
    };

    fetchOutils();
  }, []);

  const extractUniqueTags = (outilData) => {
    const tagSet = new Set();

    outilData.forEach((outil) => {
      if (Array.isArray(outil.tags)) {
        outil.tags.forEach((tag) => {
          if (tag && tag.titre) tagSet.add(tag.titre);
        });
      }
    });

    return Array.from(tagSet).sort();
  };

  useEffect(() => {
    let result = [...outils];

    if (selectedTags.length > 0) {
      result = result.filter((outil) => {
        return selectedTags.some(
          (selectedTag) =>
            Array.isArray(outil.tags) &&
            outil.tags.some((tag) => tag.titre === selectedTag),
        );
      });
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (outil) =>
          (typeof outil.titre === "string" &&
            outil.titre.toLowerCase().includes(query)) ||
          (outil.description &&
            typeof outil.description === "string" &&
            outil.description.toLowerCase().includes(query)),
      );
    }

    setFilteredOutils(result);
  }, [outils, selectedTags, searchQuery]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <main className="bg-white">
      <div className="flex flex-col gap-6 w-[90%] pt-24 pb-20 mx-auto max-w-[1440px]">
        {/* CONTENU DYNAMIQUE */}
        <div className="min-h-[calc(100vh-296px)]">
          <div className="flex flex-col gap-8 md:gap-12 w-full">
            <div className="flex flex-col gap-6 md:gap-4">
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
                        <NumberFlow value={filteredOutils.length} /> outil
                        {filteredOutils.length > 1 ? "s" : ""} disponible
                        {filteredOutils.length > 1 ? "s" : ""}
                      </p>
                      <p className="text-lg text-blue-900">
                        100% gratuit et open source
                      </p>
                    </>
                  )}
                </div>
                <div className="w-full md:w-auto relative">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Rechercher un outil..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-2 px-4 bg-slate-200 dark:bg-blue-50 dark:text-blue-950 dark:placeholder:text-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 md:w-64 lg:w-96"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => {
                    // Compter le nombre total d'outils avec ce tag (fixe)
                    const count = outils.filter(
                      (outil) =>
                        Array.isArray(outil.tags) &&
                        outil.tags.some((outilTag) => outilTag.titre === tag),
                    ).length;

                    return (
                      <TagCheckbox
                        key={tag}
                        type={tag}
                        count={count}
                        selected={selectedTags.includes(tag)}
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
                  {/* Génération de 6 cartes squelettes pour les outils */}
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={`outil-skeleton-${index}`}
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
              ) : filteredOutils.length > 0 ? (
                <AnimatePresence>
                  <motion.div
                    key={filteredOutils.length}
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
                    {filteredOutils.map((outil) => {
                      return (
                        <motion.div
                          key={outil.id_outil}
                          variants={{
                            hidden: { opacity: 0, scale: 0.9, y: 20 },
                            visible: { opacity: 1, scale: 1, y: 0 },
                          }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <OutilItem
                            id={outil.id_outil}
                            title={outil.titre}
                            description={outil.description}
                            miniature={outil.miniature || "#"}
                            tags={outil.tags}
                            logo={outil.logo}
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col justify-center items-center">
                  <p className="text-xl font-rethink-sans text-blue-600 font-bold">
                    Oh non ! Aucun outil ne correspond à vos critères 😭
                  </p>
                  <p className="text-base text-blue-900">
                    Essayez de modifier vos filtres ou votre recherche 🔍
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Effet de fond */}
      <div className="absolute top-0 left-0 w-full h-14 bg-linear-to-t from-blue-100/0 to-blue-100/75 pointer-events-none"></div>
    </main>
  );
}
