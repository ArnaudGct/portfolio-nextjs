"use client";
import { useEffect, useState } from "react";
import AutreItem from "./../../components/AutreItem";
import TagCheckbox from "./../../components/TagCheckbox";
import FilterTag from "./../../components/FilterTag";
import { motion, AnimatePresence } from "motion/react";
import NumberFlow from "@number-flow/react";

export default function Autre() {
  const [autres, setAutres] = useState([]);
  const [filteredAutres, setFilteredAutres] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  console.log(setFilteredAutres);

  useEffect(() => {
    const fetchAutres = async () => {
      try {
        setIsLoading(true); // ⬅️ début du chargement

        const res = await fetch("/api/creations/autre");
        const data = await res.json();

        setAutres(data);
        setFilteredAutres(data);

        const uniqueTags = extractUniqueTags(data);
        setAllTags(uniqueTags);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des autres créations :",
          error
        );
      } finally {
        setIsLoading(false); // ⬅️ fin du chargement
      }
    };

    fetchAutres();
  }, []);

  const extractUniqueTags = (autresData) => {
    const tagSet = new Set();

    autresData.forEach((autre) => {
      autre.tags.forEach((tag) => {
        if (tag && tag.titre) tagSet.add(tag.titre); // 👈 ajoute seulement le titre
      });

      if (autre.categories && Array.isArray(autre.categories)) {
        autre.categories.forEach((cat) => {
          if (cat) tagSet.add(cat);
        });
      }
    });

    return Array.from(tagSet).sort();
  };

  useEffect(() => {
    let result = [...autres];

    if (selectedTags.length > 0) {
      result = result.filter((autre) => {
        // Fusionne les tags + categories
        const allTags = [
          ...(Array.isArray(autre.tags) ? autre.tags : []),
          ...(Array.isArray(autre.categories) ? autre.categories : []),
        ];

        return selectedTags.every((tag) => allTags.includes(tag));
      });
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();

      result = result.filter((autre) => {
        const inTitle = autre.titre.toLowerCase().includes(query);
        const inDescription = autre.description?.toLowerCase().includes(query);
        const inTags = autre.tags?.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        const inCategories = autre.categories?.some((cat) =>
          cat.toLowerCase().includes(query)
        );

        return inTitle || inDescription || inTags || inCategories;
      });
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
      .map((v) => (v.date ? new Date(v.date) : null))
      .filter(Boolean);

    if (dates.length === 0) return "Date inconnue";

    const latestDate = new Date(Math.max(...dates));
    const diffTime = Math.abs(new Date() - latestDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${diffDays} jour${
      diffDays > 1 ? "s" : ""
    } depuis l'ajout d'une autre création`;
  };

  return (
    <div className="flex flex-col gap-8 md:gap-12 w-full">
      <div className="flex flex-col gap-8 md:gap-4">
        <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center">
          <div className="flex flex-col">
            <p className="text-2xl font-extrabold font-rethink-sans text-blue-600">
              <NumberFlow value={filteredAutres.length} /> autre{" "}
              {filteredAutres.length > 1 ? "s" : ""} création
              {filteredAutres.length > 1 ? "s" : ""} disponible
              {filteredAutres.length > 1 ? "s" : ""}
            </p>
            <p className="text-lg text-blue-900">{getLastAddedDays()}</p>
          </div>
          <div className="w-full md:w-auto relative">
            <div className="flex">
              <input
                type="text"
                placeholder="Rechercher une création..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 bg-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 md:w-64 lg:w-96"
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
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          </div>
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
              {filteredAutres.map((autre) => (
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
                    url={autre.lien}
                    tags={autre.tags}
                  />
                </motion.div>
              ))}
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
