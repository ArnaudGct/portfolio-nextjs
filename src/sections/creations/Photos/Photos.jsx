"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import NumberFlow from "@number-flow/react";
import AlbumsGallery from "./AlbumsGallery";
import {
  X,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  SquareArrowOutUpRight,
} from "lucide-react";
import ButtonMain from "../../../components/ButtonMain";
import ButtonSecondary from "../../../components/ButtonSecondary";
import Tag from "../../../components/Tag";
import TagCheckbox from "../../../components/TagCheckbox";
import FilterTag from "../../../components/FilterTag";
import Link from "next/link";

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAlbumsLoading, setIsAlbumsLoading] = useState(true);

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
              ...new Set([...(photo.tags || []), ...tagsRecherche]),
            ],
            date_ajout: photo.date_ajout ? new Date(photo.date_ajout) : null,
          };
        });

        setPhotos(cleanedData);
        setFilteredPhotos(cleanedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des photos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAlbums = async () => {
      try {
        setIsAlbumsLoading(true);
        const res = await fetch("/api/creations/photos_albums");
        const data = await res.json();
        setAlbums(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des albums:", err);
      } finally {
        setIsAlbumsLoading(false);
      }
    };

    fetchPhotos();
    fetchAlbums();
  }, []);

  useEffect(() => {
    const tagsFromPhotos = photos.flatMap((p) => p.allTags || []);
    const tagsFromAlbums = albums.flatMap((a) => a.tags || []);
    const uniqueTags = Array.from(
      new Set([...tagsFromPhotos, ...tagsFromAlbums])
    ).sort();

    setAllTags(uniqueTags);
  }, [photos, albums]);

  useEffect(() => {
    let resultPhotos = [...photos];
    let resultAlbums = [...albums];

    if (selectedTags.length > 0) {
      resultPhotos = resultPhotos.filter((photo) =>
        selectedTags.every((tag) => photo.allTagsSearch.includes(tag))
      );

      resultAlbums = resultAlbums.filter((album) =>
        selectedTags.every((tag) => album.tags.includes(tag))
      );
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      resultPhotos = resultPhotos.filter((photo) =>
        photo.allTagsSearch?.some((tag) => tag.toLowerCase().includes(query))
      );

      resultAlbums = resultAlbums.filter((album) =>
        album.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredPhotos(resultPhotos);
    setFilteredAlbums(resultAlbums);
  }, [photos, albums, selectedTags, searchQuery]);

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

  const getLastAdded = () => {
    const photoDates = photos
      .map(
        (p) => p.date_ajout && { type: "photo", date: new Date(p.date_ajout) }
      )
      .filter(Boolean);
    const albumDates = albums
      .map((a) => a.date && { type: "album", date: new Date(a.date) })
      .filter(Boolean);

    const allEntries = [...photoDates, ...albumDates];
    if (!allEntries.length) return "Date inconnue";

    const latest = allEntries.reduce((latest, current) =>
      current.date > latest.date ? current : latest
    );

    const now = new Date();
    const diffMs = now.getTime() - latest.date.getTime();
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

    const article = latest.type === "album" ? "un" : "une";

    return `${timeText} depuis l'ajout d'${article} ${latest.type}`;
  };

  return (
    <div className="flex flex-col gap-8 md:gap-12 w-full">
      <div className="flex flex-col gap-8 md:gap-4">
        <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center">
          <div className="flex flex-col">
            <p className="text-2xl font-extrabold font-rethink-sans text-blue-600">
              <NumberFlow value={filteredAlbums.length} /> album
              {filteredAlbums.length > 1 ? "s" : ""} et{" "}
              <NumberFlow value={filteredPhotos.length} /> photo
              {filteredPhotos.length > 1 ? "s" : ""} disponible
              {filteredAlbums.length + filteredPhotos.length > 1 ? "s" : ""}
            </p>
            <p className="text-lg text-blue-900">{getLastAdded()}</p>
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

      <div className="min-h-[calc(100vh-296px)] flex flex-col gap-10">
        {/* Albums */}
        {isAlbumsLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredAlbums.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 gap-6 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.1 },
              },
              hidden: {},
            }}
          >
            {filteredAlbums.map((album) => (
              <motion.div
                key={`album-${album.id_alb}`}
                variants={{
                  hidden: { opacity: 0, scale: 0.9, y: 20 },
                  visible: { opacity: 1, scale: 1, y: 0 },
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-lg overflow-hidden"
              >
                <Link
                  href={`/creations/album/${album.id_alb}`}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col gap-4 rounded-lg">
                    <div className="relative h-52 w-full overflow-hidden rounded-lg bg-slate-100">
                      {album.photos.length > 0 ? (
                        <div className="absolute inset-0 w-full h-full transition-transform duration-500 hover:scale-105">
                          <div className="w-full h-full grid grid-cols-3 xs:grid-cols-2 md:grid-cols-3 grid-rows-2 gap-0.5 p-0.5 rounded-lg overflow-hidden">
                            {/* Photo 1 – grande image, colonne de gauche (2 lignes) */}
                            {album.photos[0] && (
                              <div className="col-span-1 row-span-2 relative rounded-lg overflow-hidden">
                                <Image
                                  src={album.photos[0].lien_low}
                                  alt={album.titre}
                                  fill
                                  sizes="(max-width: 768px) 50vw, 25vw"
                                  className="object-cover rounded-lg"
                                  priority
                                />
                              </div>
                            )}

                            {/* Photo 2 – colonne droite ligne 1 */}
                            {album.photos[1] && (
                              <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                                <Image
                                  src={album.photos[1].lien_low}
                                  alt={`${album.titre} photo 2`}
                                  fill
                                  sizes="(max-width: 768px) 50vw, 25vw"
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            )}

                            {/* Photo 3 – colonne droite ligne 2 */}
                            {album.photos[2] && (
                              <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                                <Image
                                  src={album.photos[2].lien_low}
                                  alt={`${album.titre} photo 3`}
                                  fill
                                  sizes="(max-width: 768px) 50vw, 25vw"
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            )}

                            {/* Photo 4 – affichée uniquement en md+ */}
                            {album.photos[3] && (
                              <div className="block xs:hidden md:block col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                                <Image
                                  src={album.photos[3].lien_low}
                                  alt={`${album.titre} photo 4`}
                                  fill
                                  sizes="25vw"
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            )}

                            {/* Photo 5 – affichée uniquement en md+ */}
                            {album.photos[4] && (
                              <div className="block xs:hidden md:block col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                                <Image
                                  src={album.photos[4].lien_low}
                                  alt={`${album.titre} photo 5`}
                                  fill
                                  sizes="25vw"
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-slate-400">Aucune photo</p>
                        </div>
                      )}
                    </div>

                    {/* <div className="p-4">
                      <div className="flex items-center justify-between text-blue-600">
                        <p className="font-bold text-lg text-blue-600">
                          {album.titre}
                        </p>
                        <ChevronRight size={20} />
                      </div>

                      <span className="text-sm text-blue-400">
                        {album.photos.length} photo
                        {album.photos.length > 1 ? "s" : ""}
                      </span>

                      <div className="flex justify-between items-center mt-3">
                        {album.date && (
                          <span className="text-xs text-slate-400">
                            {new Date(album.date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div> */}

                    <div className="w-full flex items-center justify-between">
                      <div className="w-[90%] flex flex-col gap-2">
                        <div className="flex flex-col">
                          <p className="w-full text-xl font-extrabold font-rethink-sans text-blue-900 truncate">
                            {album.titre}
                          </p>
                          <span className="text-sm text-blue-400">
                            {album.photos.length} photo
                            {album.photos.length > 1 ? "s" : ""}
                          </span>
                        </div>

                        {album.tags.length > 0 && (
                          <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                            <Tag name="Album" background={true} />
                            {album.tags.map((t, index) => (
                              <Tag
                                key={`${t}-${index}`}
                                name={t}
                                background={false}
                              />
                            ))}
                          </div>
                        )}

                        {/* {album.date && (
                            <span className="text-sm text-slate-400">
                              {new Date(album.date).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          )} */}
                      </div>
                      <div className="flex justify-center items-center p-2 text-blue-700 min-w-9 w-[10%] hover:text-blue-900 transition-colors">
                        <SquareArrowOutUpRight size={16} strokeWidth={1.75} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        {/* Photos */}

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
                  className="group cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => handleImageClick(index)}
                >
                  <Image
                    src={photo.lien_low}
                    alt={photo.titre}
                    width={500}
                    height={300}
                    className="w-full h-auto object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : // <AlbumsGallery album={filteredPhotos} />
        null}
        {!isAlbumsLoading &&
          !isLoading &&
          filteredAlbums.length === 0 &&
          filteredPhotos.length === 0 && (
            <div className="flex flex-col justify-center items-center py-10">
              <p className="text-xl font-rethink-sans text-blue-600 font-bold">
                Aucun contenu disponible pour le moment 😢
              </p>
              <p className="text-base text-blue-900">
                Essayez de revenir plus tard ou ajustez vos filtres 🔍
              </p>
            </div>
          )}
      </div>

      {/* Modal code - this remains the same as your original code */}
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
            <motion.div
              className="absolute inset-0 bg-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

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
              </motion.div>

              <div className="relative flex-grow flex items-center justify-center bg-slate-100 overflow-hidden">
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

              <div
                className="p-4 bg-white border-t border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <div className="flex flex-wrap gap-2 mt-2">
                  {filteredPhotos[currentPhotoIndex].tags.map(
                    (tag, tagIndex) => (
                      <div
                        key={`${tag}-${tagIndex}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.5 + tagIndex * 0.05,
                          duration: 0.2,
                        }}
                      >
                        <Tag name={tag} />
                      </div>
                    )
                  )}
                </div>

                <div
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
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
