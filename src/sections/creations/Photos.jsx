"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import ButtonMain from "./../../components/ButtonMain";
import ButtonSecondary from "./../../components/ButtonSecondary";
import Tag from "./../../components/Tag";
import TagCheckbox from "./../../components/TagCheckbox";
import FilterTag from "./../../components/FilterTag";

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isModalOpen]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/creations/photos");
        const data = await res.json();

        const cleanedData = data.map((photo) => {
          const tagsRecherche = photo.tags_recherche || [];

          return {
            ...photo,
            allTags: photo.tags || [],
            allTagsSearch: [
              ...new Set([...(photo.tags || []), ...tagsRecherche]), // Combine les tags classiques et de recherche
            ],
            date_ajout: photo.date_ajout ? new Date(photo.date_ajout) : null,
          };
        });

        setPhotos(cleanedData);
        setFilteredPhotos(cleanedData);

        // Extraire tous les tags uniques visibles pour l'affichage
        const allVisibleTags = Array.from(
          new Set(cleanedData.flatMap((p) => p.allTags || []))
        ).sort();

        setAllTags(allVisibleTags); // Mettre à jour les tags visibles
      } catch (err) {
        console.error("Erreur lors de la récupération des photos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  useEffect(() => {
    let result = [...photos];

    // Filtrer en fonction des tags sélectionnés
    if (selectedTags.length > 0) {
      result = result.filter(
        (photo) =>
          selectedTags.every((tag) => photo.allTagsSearch.includes(tag)) // Chercher dans allTagsSearch
      );
    }

    // Recherche par mot-clé
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (photo) =>
          photo.allTagsSearch?.some((tag) => tag.toLowerCase().includes(query)) // Recherche dans allTagsSearch
      );
    }

    setFilteredPhotos(result);
  }, [photos, selectedTags, searchQuery]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleImageClick = (index) => {
    setCurrentPhotoIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPhotoIndex(null);
  };

  const handleNextPhoto = () => {
    if (currentPhotoIndex < filteredPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const getLastAddedDays = () => {
    if (!photos.length) return "Aucune photo";
    const dates = photos.map((p) => p.date_ajout).filter(Boolean);
    if (!dates.length) return "Date inconnue";

    const latest = new Date(Math.max(...dates));
    const diffDays = Math.ceil(
      (new Date().getTime() - latest.getTime()) / (1000 * 3600 * 24)
    );
    return `${diffDays} jour${diffDays > 1 ? "s" : ""} depuis l'ajout`;
  };

  return (
    <div className="flex flex-col gap-8 md:gap-12 w-full">
      <div className="flex flex-col gap-8 md:gap-4">
        <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center">
          <div className="flex flex-col">
            <p className="text-2xl font-extrabold font-rethink-sans text-blue-600">
              <NumberFlow value={filteredPhotos.length} /> photo
              {filteredPhotos.length > 1 ? "s" : ""} disponible
              {filteredPhotos.length > 1 ? "s" : ""}
            </p>
            <p className="text-lg text-blue-900">{getLastAddedDays()}</p>
          </div>
          <div className="w-full md:w-auto relative">
            <div className="flex">
              <input
                type="text"
                placeholder="Rechercher une photo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 bg-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 md:w-64 lg:w-96"
              />
            </div>
          </div>
        </div>

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

        {/* ACTIVE FILTERS */}
        {(selectedTags.length > 0 || searchQuery) && (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
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
              {selectedTags.map((tag) => (
                <FilterTag
                  key={tag}
                  label={tag}
                  color="green"
                  onRemove={() => toggleTag(tag)}
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

      <div className="min-h-[calc(100vh-296px)]">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredPhotos.length > 0 ? (
          <AnimatePresence>
            <motion.div
              key="photo-grid"
              className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4 xl:gap-10"
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
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={`photo-${photo.id_pho}`}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9, y: 20 },
                    visible: { opacity: 1, scale: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => handleImageClick(index)} // Ouvre la modale en fonction de l'index
                  >
                    <Image
                      src={photo.lien_low}
                      alt="bibou"
                      width={500}
                      height={300}
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <p className="text-xl font-rethink-sans text-blue-600 font-bold">
              Oh non ! Aucune photo ne correspond à vos critères 😭
            </p>
            <p className="text-base text-blue-900">
              Essayez de modifier vos filtres ou votre recherche 🔍
            </p>
          </div>
        )}
      </div>

      {/* Modale */}

      <AnimatePresence>
        {isModalOpen && currentPhotoIndex !== null && (
          <motion.div
            className="fixed inset-0 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeModal}
          >
            {/* Overlay avec animation indépendante */}
            <motion.div
              className="absolute inset-0 bg-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Contenu du modal avec animation - sans header */}
            <motion.div
              className="relative w-full max-w-6xl h-full max-h-[90vh] flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl m-4 md:m-6 lg:m-8"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.4,
              }}
            >
              {/* Bouton fermer repositionné en haut à droite */}
              <motion.div
                className="absolute top-3 right-3 z-20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ButtonMain
                  onClick={closeModal}
                  icon={<X size={16} strokeWidth={1.75} />}
                />
                {/* <span className="text-white text-xl">&times;</span> */}
              </motion.div>

              {/* Container principal pour l'image - maintenant sans header au-dessus */}
              <div className="relative flex-grow flex items-center justify-center bg-slate-100 overflow-hidden">
                {/* Flèches latérales - visibles uniquement sur desktop et tablette */}
                <motion.div
                  disabled={currentPhotoIndex === 0}
                  className={`absolute left-4 z-10 hidden md:flex items-center justify-center`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={currentPhotoIndex !== 0 ? { scale: 1.1 } : {}}
                  whileTap={currentPhotoIndex !== 0 ? { scale: 0.9 } : {}}
                >
                  <ButtonSecondary
                    onClick={handlePrevPhoto}
                    icon={<ArrowLeft size={20} strokeWidth={1.75} />}
                    isDisabled={currentPhotoIndex === 0}
                    className={`${
                      currentPhotoIndex === 0 ? "opacity-40" : "opacity-100"
                    }`}
                  />
                </motion.div>

                {/* Image avec animation de chargement */}
                <motion.div
                  className="w-full h-full flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  key={`photo-${currentPhotoIndex}`}
                >
                  <Image
                    src={filteredPhotos[currentPhotoIndex].lien_high}
                    alt="bibou"
                    width={1200}
                    height={800}
                    className="max-w-full max-h-[calc(90vh-10rem)] object-contain"
                    priority
                  />
                </motion.div>

                {/* Flèche droite - visible uniquement sur desktop et tablette */}
                <motion.div
                  disabled={currentPhotoIndex === filteredPhotos.length - 1}
                  className={`absolute right-4 z-10 hidden md:flex items-center justify-center`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={
                    currentPhotoIndex !== filteredPhotos.length - 1
                      ? { scale: 1.1 }
                      : {}
                  }
                  whileTap={
                    currentPhotoIndex !== filteredPhotos.length - 1
                      ? { scale: 0.9 }
                      : {}
                  }
                >
                  <ButtonSecondary
                    onClick={handleNextPhoto}
                    isDisabled={currentPhotoIndex === filteredPhotos.length - 1}
                    icon={<ArrowRight size={20} strokeWidth={1.75} />}
                    className={` 
                     ${
                       currentPhotoIndex === filteredPhotos.length - 1
                         ? "opacity-40"
                         : "opacity-100"
                     }`}
                  />
                </motion.div>
              </div>

              {/* Barre de navigation mobile - visible uniquement sur mobile */}
              <motion.div
                className="flex md:hidden justify-center items-center gap-8 py-3 bg-slate-100 border-t border-blue-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  disabled={currentPhotoIndex === 0}
                  className={`flex items-center justify-center`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={currentPhotoIndex !== 0 ? { scale: 1.05 } : {}}
                  whileTap={currentPhotoIndex !== 0 ? { scale: 0.95 } : {}}
                >
                  <ButtonSecondary
                    onClick={handlePrevPhoto}
                    icon={<ArrowLeft size={20} strokeWidth={1.75} />}
                    isDisabled={currentPhotoIndex === 0}
                    className={`${
                      currentPhotoIndex === 0 ? "opacity-40" : "opacity-100"
                    }`}
                  />
                </motion.div>

                <span className="text-blue-600 font-medium">
                  {currentPhotoIndex + 1} / {filteredPhotos.length}
                </span>

                <motion.div
                  disabled={currentPhotoIndex === filteredPhotos.length - 1}
                  className={`flex items-center justify-center`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={
                    currentPhotoIndex !== filteredPhotos.length - 1
                      ? { scale: 1.05 }
                      : {}
                  }
                  whileTap={
                    currentPhotoIndex !== filteredPhotos.length - 1
                      ? { scale: 0.95 }
                      : {}
                  }
                >
                  <ButtonSecondary
                    onClick={handleNextPhoto}
                    isDisabled={currentPhotoIndex === filteredPhotos.length - 1}
                    icon={<ArrowRight size={20} strokeWidth={1.75} />}
                    className={` 
                     ${
                       currentPhotoIndex === filteredPhotos.length - 1
                         ? "opacity-40"
                         : "opacity-100"
                     }`}
                  />
                </motion.div>
              </motion.div>

              {/* Footer avec animation */}
              <motion.div
                className="p-4 bg-white border-t border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <div className="flex flex-wrap gap-2 mt-2">
                  {filteredPhotos[currentPhotoIndex].tags.map(
                    (tag, tagIndex) => (
                      <motion.div
                        key={`${tag}-${tagIndex}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.5 + tagIndex * 0.05,
                          duration: 0.2,
                        }}
                      >
                        <Tag name={tag} />
                      </motion.div>
                    )
                  )}
                </div>

                <motion.div
                  className="justify-between items-center mt-4 text-sm text-gray-500 md:flex hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <p className="text-blue-600 font-medium">
                    {currentPhotoIndex + 1} / {filteredPhotos.length}
                  </p>
                  {filteredPhotos[currentPhotoIndex].date_ajout && (
                    <p className="text-blue-300">
                      Ajoutée le{" "}
                      {filteredPhotos[
                        currentPhotoIndex
                      ].date_ajout.toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
