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
  Loader2,
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
  const [modalImageLoading, setModalImageLoading] = useState(true);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [photoLoadingState, setPhotoLoadingState] = useState({});
  const [isAlbumsLoading, setIsAlbumsLoading] = useState(true);
  const [albumImageLoadingStates, setAlbumImageLoadingStates] = useState({});
  const [isVisuallyLoading, setIsVisuallyLoading] = useState(true);
  const [isAlbumsVisuallyLoading, setIsAlbumsVisuallyLoading] = useState(true);
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
        setIsVisuallyLoading(true);
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
            date: photo.date ? new Date(photo.date) : null,
          };
        });

        setPhotos(cleanedData);
        setFilteredPhotos(cleanedData);

        // Marquer que le chargement réel est terminé
        setIsLoading(false);

        // Imposer un délai minimum pour l'affichage du skeleton
        const minLoadingTime = 300; // 600ms minimum
        setTimeout(() => {
          setIsVisuallyLoading(false);
        }, minLoadingTime);
      } catch (err) {
        console.error("Erreur lors de la récupération des photos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAlbums = async () => {
      try {
        setIsAlbumsLoading(true);
        setIsAlbumsVisuallyLoading(true);
        const res = await fetch("/api/creations/photos_albums");
        const data = await res.json();
        setAlbums(data);

        // Marquer que le chargement réel est terminé
        setIsAlbumsLoading(false);

        // Imposer un délai minimum pour l'affichage du skeleton
        const minLoadingTime = 300; // 600ms minimum
        setTimeout(() => {
          setIsAlbumsVisuallyLoading(false);
        }, minLoadingTime);
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

  // Améliorer la fonction resetLoadingStates pour réinitialiser TOUS les états de chargement
  const resetLoadingStates = () => {
    // Réinitialiser immédiatement les skeletons pour qu'ils n'apparaissent pas lors du filtrage
    setIsVisuallyLoading(false);
    setIsAlbumsVisuallyLoading(false);

    // IMPORTANT: Ne plus réinitialiser les états de chargement des images individuelles
    // pour éviter de refaire charger les images déjà chargées
    // setAlbumImageLoadingStates({});
    // setPhotoLoadingState({});
  };

  // Modifier le useEffect de filtrage pour mieux gérer les états de chargement
  useEffect(() => {
    // Si on est en train de filtrer (pas le chargement initial), réinitialiser d'abord les skeletons
    if (!isVisuallyLoading || !isAlbumsVisuallyLoading) {
      resetLoadingStates();
    }

    let resultPhotos = [...photos];
    let resultAlbums = [...albums];
    if (selectedTags.length > 0) {
      resultPhotos = resultPhotos.filter((photo) =>
        selectedTags.every((tag) =>
          // Vérifier que allTagsSearch existe avant de l'utiliser
          (photo.allTagsSearch || []).includes(tag)
        )
      );

      resultAlbums = resultAlbums.filter((album) =>
        selectedTags.every((tag) =>
          // Vérifier que tags existe avant de l'utiliser
          (album.tags || []).includes(tag)
        )
      );
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();

      // Recherche dans les photos
      resultPhotos = resultPhotos.filter((photo) => {
        // Vérifier aussi le titre en plus des tags
        const titleMatch =
          photo.titre && photo.titre.toLowerCase().includes(query);
        const tagsMatch = (photo.allTagsSearch || []).some((tag) =>
          (tag || "").toLowerCase().includes(query)
        );
        return titleMatch || tagsMatch;
      });

      // Recherche dans les albums
      resultAlbums = resultAlbums.filter((album) => {
        const titleMatch =
          album.titre && album.titre.toLowerCase().includes(query);
        const tagsMatch = (album.tags || []).some((tag) =>
          (tag || "").toLowerCase().includes(query)
        );
        return titleMatch || tagsMatch;
      });
    }

    // Après avoir défini filteredPhotos et filteredAlbums, initialiser états de chargement
    setFilteredPhotos(resultPhotos);
    setFilteredAlbums(resultAlbums);

    // SUPPRIMER complètement ce setTimeout qui réinitialise les états de chargement
    // et le remplacer par une initialisation intelligente SEULEMENT pour les nouveaux éléments

    // Pour les albums filtrés, initialiser les états de chargement
    if (resultAlbums.length > 0) {
      setAlbumImageLoadingStates((prevState) => {
        const newState = { ...prevState };

        resultAlbums.forEach((album) => {
          // SEULEMENT si l'album n'existe pas encore dans l'état, l'initialiser
          if (newState[album.id_alb] === undefined) {
            newState[album.id_alb] = true; // true = en cours de chargement
          }
        });

        return newState;
      });
    }

    // Pour les photos filtrées, ne créer des états de chargement que pour les NOUVELLES photos
    if (resultPhotos.length > 0) {
      setPhotoLoadingState((prevState) => {
        const newState = { ...prevState };

        resultPhotos.forEach((photo) => {
          // SEULEMENT si la photo n'existe pas encore dans l'état, l'initialiser
          if (newState[photo.id_pho] === undefined) {
            newState[photo.id_pho] = true; // true = en cours de chargement pour les nouvelles photos
          }
          // Si la photo existe déjà, ne RIEN faire (garde son état actuel)
        });

        return newState;
      });
    }
  }, [photos, albums, selectedTags, searchQuery]);

  // Ajouter une fonction pour nettoyer les états de chargement des éléments qui ne sont plus affichés
  useEffect(() => {
    // Nettoyer les états de chargement des albums qui ne sont plus dans les résultats filtrés
    setAlbumImageLoadingStates((prevState) => {
      const newState = { ...prevState };
      const currentAlbumIds = filteredAlbums.map((album) => album.id_alb);

      // Garder seulement les états des albums actuellement affichés
      Object.keys(newState).forEach((albumId) => {
        if (!currentAlbumIds.includes(parseInt(albumId))) {
          delete newState[albumId];
        }
      });

      return newState;
    });

    // Nettoyer les états de chargement des photos qui ne sont plus dans les résultats filtrés
    setPhotoLoadingState((prevState) => {
      const newState = { ...prevState };
      const currentPhotoIds = filteredPhotos.map((photo) => photo.id_pho);

      // Garder seulement les états des photos actuellement affichées
      Object.keys(newState).forEach((photoId) => {
        if (!currentPhotoIds.includes(parseInt(photoId))) {
          delete newState[photoId];
        }
      });

      return newState;
    });
  }, [filteredAlbums, filteredPhotos]);

  // Simplifier la fonction handleAlbumImageLoad
  const handleAlbumImageLoad = (albumId) => {
    setAlbumImageLoadingStates((prev) => ({
      ...prev,
      [albumId]: false, // false = chargement terminé
    }));
  };

  // Ajouter cette fonction pour gérer le chargement des photos
  const handlePhotoLoad = (photoId) => {
    setPhotoLoadingState((prev) => ({
      ...prev,
      [photoId]: false, // false = chargement terminé
    }));
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleImageClick = (index) => {
    setCurrentPhotoIndex(index);
    setIsModalOpen(true);
    setModalImageLoading(true);
    setHighResLoaded(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPhotoIndex(null);
    setHighResLoaded(false);
  };

  const handleNextPhoto = () => {
    if (currentPhotoIndex < filteredPhotos.length - 1) {
      setModalImageLoading(true);
      setHighResLoaded(false);
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setModalImageLoading(true);
      setHighResLoaded(false);
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleLowResLoad = () => {
    setModalImageLoading(false);
  };

  const handleHighResLoad = () => {
    setHighResLoaded(true);
  };

  const getLastAdded = () => {
    const photoDates = photos
      .map(
        (p) =>
          p.derniere_modification && {
            type: "photo",
            date: new Date(p.derniere_modification),
          }
      )
      .filter(Boolean);
    const albumDates = albums
      .map(
        (a) =>
          a.derniere_modification && {
            type: "album",
            date: new Date(a.derniere_modification),
          }
      )
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

    return `${timeText} depuis la modification d'${article} ${latest.type}`;
  };

  return (
    <div className="flex flex-col gap-8 md:gap-12 w-full">
      <div className="flex flex-col gap-8 md:gap-4">
        <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center">
          <div className="flex flex-col">
            {isVisuallyLoading ? (
              <>
                <div className="h-8 w-80 bg-blue-100/40 rounded-md mb-2"></div>
                <div className="h-6 w-72 bg-blue-100/40 rounded-md"></div>
              </>
            ) : (
              <>
                <p className="text-2xl font-extrabold font-rethink-sans text-blue-600">
                  {filteredPhotos.length === 0 ? (
                    <>
                      <NumberFlow value={filteredAlbums.length} /> album
                      {filteredAlbums.length > 1 ? "s" : ""} disponible
                      {filteredAlbums.length > 1 ? "s" : ""}
                    </>
                  ) : (
                    <>
                      <NumberFlow value={filteredAlbums.length} /> album
                      {filteredAlbums.length > 1 ? "s" : ""} et{" "}
                      <NumberFlow value={filteredPhotos.length} /> photo
                      {filteredPhotos.length > 1 ? "s" : ""} disponible
                      {filteredAlbums.length + filteredPhotos.length > 1
                        ? "s"
                        : ""}
                    </>
                  )}
                </p>
                <p className="text-lg text-blue-900">{getLastAdded()}</p>
              </>
            )}
          </div>
          <div className="w-full md:w-auto relative">
            <div className="flex">
              <input
                type="text"
                placeholder="Rechercher une photo ou album..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 bg-slate-200 dark:bg-blue-50 dark:text-blue-950 dark:placeholder:text-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 md:w-64 lg:w-96"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            // Au lieu de compter sur tous les éléments, compter seulement sur les éléments filtrés
            let availablePhotos = photos;
            let availableAlbums = albums;

            // Si des tags sont sélectionnés, filtrer d'abord par les autres tags (excluant le tag actuel)
            if (selectedTags.length > 0) {
              const otherSelectedTags = selectedTags.filter((t) => t !== tag);

              if (otherSelectedTags.length > 0) {
                availablePhotos = photos.filter((photo) =>
                  otherSelectedTags.every((selectedTag) =>
                    (photo.allTagsSearch || []).includes(selectedTag)
                  )
                );

                availableAlbums = albums.filter((album) =>
                  otherSelectedTags.every((selectedTag) =>
                    (album.tags || []).includes(selectedTag)
                  )
                );
              }
            }

            // Appliquer le filtre de recherche si présent
            if (searchQuery.trim() !== "") {
              const query = searchQuery.toLowerCase().trim();

              availablePhotos = availablePhotos.filter((photo) => {
                const titleMatch =
                  photo.titre && photo.titre.toLowerCase().includes(query);
                const tagsMatch = (photo.allTagsSearch || []).some((photoTag) =>
                  (photoTag || "").toLowerCase().includes(query)
                );
                return titleMatch || tagsMatch;
              });

              availableAlbums = availableAlbums.filter((album) => {
                const titleMatch =
                  album.titre && album.titre.toLowerCase().includes(query);
                const tagsMatch = (album.tags || []).some((albumTag) =>
                  (albumTag || "").toLowerCase().includes(query)
                );
                return titleMatch || tagsMatch;
              });
            }

            // Maintenant compter seulement les éléments disponibles qui ont ce tag
            const photoCount = availablePhotos.filter((photo) =>
              (photo.allTags || []).includes(tag)
            ).length;

            const albumCount = availableAlbums.filter((album) =>
              (album.tags || []).includes(tag)
            ).length;

            const totalCount = photoCount + albumCount;

            return (
              <TagCheckbox
                key={tag}
                type={tag}
                count={<NumberFlow value={totalCount} />}
                selected={selectedTags.includes(tag)}
                onToggle={toggleTag}
              />
            );
          })}
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
        {isAlbumsVisuallyLoading ? (
          <motion.div
            className="grid grid-cols-1 gap-6 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {/* Génération de 4 cartes squelettes pour les albums */}
            {[...Array(4)].map((_, index) => (
              <div
                key={`album-skeleton-${index}`}
                className="rounded-lg overflow-hidden"
              >
                <div className="flex flex-col gap-4 rounded-lg">
                  <div className="relative h-52 w-full overflow-hidden rounded-lg bg-blue-100/40"></div>
                  <div className="w-full flex flex-col gap-3">
                    <div className="w-3/4 h-6 bg-blue-100/40 rounded-md"></div>
                    <div className="w-1/4 h-4 bg-blue-100/40 rounded-md"></div>
                    <div className="flex gap-2 mt-1">
                      <div className="w-16 h-5 bg-blue-100/40 rounded-full"></div>
                      <div className="w-20 h-5 bg-blue-100/40 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : filteredAlbums.length > 0 ? (
          <AnimatePresence>
            <motion.div
              className="grid grid-cols-1 gap-6 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
              {filteredAlbums.map((album) => (
                <motion.div
                  key={`album-${album.id_alb}`}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9, y: 20 },
                    visible: { opacity: 1, scale: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="rounded-lg overflow-hidden group"
                >
                  <Link
                    href={`/creations/album/${album.id_alb}`}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="relative h-52 w-full overflow-hidden rounded-lg bg-slate-100">
                        {album.photos.length > 0 ? (
                          <div className="absolute inset-0 w-full h-full">
                            {/* Loader pendant le chargement */}
                            {albumImageLoadingStates[album.id_alb] !==
                              false && (
                              <div className="absolute inset-0 z-20 bg-slate-100 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                  <p className="text-sm text-blue-600 font-medium">
                                    Chargement de l'aperçu...
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Image composite */}
                            <div
                              className={`w-full h-full transition-all duration-500 ${
                                albumImageLoadingStates[album.id_alb] === false
                                  ? "opacity-100 scale-100"
                                  : "opacity-0 scale-95"
                              } transition-transform duration-500 group-hover:scale-105`}
                            >
                              <Image
                                src={album.lien_cover}
                                alt={`Aperçu de l'album ${album.titre}`}
                                fill
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                                priority={false}
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover rounded-lg"
                                onLoad={() =>
                                  handleAlbumImageLoad(album.id_alb)
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <p className="text-slate-400">Aucune photo</p>
                          </div>
                        )}
                      </div>

                      {/* Rest of the album UI */}
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
          </AnimatePresence>
        ) : null}

        {/* Photos */}

        {isVisuallyLoading ? (
          <motion.div
            className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4 xl:gap-10"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {/* Génération de 8 cartes squelettes pour les photos */}
            {[...Array(8)].map((_, index) => (
              <div
                key={`photo-skeleton-${index}`}
                className="aspect-[4/3] rounded-lg overflow-hidden bg-blue-100/40"
              ></div>
            ))}
          </motion.div>
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
                  className="group cursor-pointer overflow-hidden rounded-lg relative"
                  onClick={() => handleImageClick(index)}
                >
                  {/* Spinner qui s'affiche pendant le chargement */}
                  {photoLoadingState[photo.id_pho] && (
                    <div className="absolute inset-0 bg-blue-50 rounded-lg z-10">
                      <div className="w-full h-full bg-blue-100/60 animate-pulse rounded-lg"></div>
                    </div>
                  )}
                  <Image
                    src={photo.lien_low}
                    alt={photo.alt}
                    width={500}
                    height={300}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    priority={false}
                    className={`w-full h-auto object-cover rounded-lg transition-transform duration-500 group-hover:scale-105 ${
                      photoLoadingState[photo.id_pho]
                        ? "opacity-0"
                        : "opacity-100 transition-opacity duration-300"
                    }`}
                    onLoad={() => handlePhotoLoad(photo.id_pho)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : null}
        {!isAlbumsLoading &&
          !isLoading &&
          // Ajout d'une condition pour vérifier que le chargement initial est terminé
          photos.length > 0 && // Si les données ont été chargées au moins une fois
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
                  className="w-full h-full flex items-center justify-center p-4 relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  key={`photo-${currentPhotoIndex}`}
                >
                  {/* Spinner pour l'image modale */}
                  {modalImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                      <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                    </div>
                  )}

                  {/* Indicateur de chargement HD */}
                  {!modalImageLoading && !highResLoaded && (
                    <div className="absolute top-4 left-4 z-20 bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement HD...
                    </div>
                  )}

                  {/* Image basse résolution - affichée en premier */}
                  <Image
                    src={filteredPhotos[currentPhotoIndex].lien_low}
                    alt={filteredPhotos[currentPhotoIndex].alt}
                    width={filteredPhotos[currentPhotoIndex].largeur}
                    height={filteredPhotos[currentPhotoIndex].hauteur}
                    className="max-w-full max-h-[calc(90vh-10rem)] object-contain"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    priority={false}
                    onLoad={handleLowResLoad}
                  />

                  {/* Image haute résolution - se superpose */}
                  {!modalImageLoading && (
                    <Image
                      src={filteredPhotos[currentPhotoIndex].lien_high}
                      alt={filteredPhotos[currentPhotoIndex].alt}
                      width={Math.floor(
                        filteredPhotos[currentPhotoIndex].largeur
                      )}
                      height={Math.floor(
                        filteredPhotos[currentPhotoIndex].hauteur
                      )}
                      className={`max-w-[90%] max-h-[calc(90vh-10rem)] object-contain absolute ${
                        highResLoaded
                          ? "opacity-100 transition-opacity duration-500"
                          : "opacity-0"
                      }`}
                      onLoad={handleHighResLoad}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      priority={false}
                    />
                  )}
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
                  {filteredPhotos[currentPhotoIndex].date && (
                    <p className="text-blue-300">
                      Ajoutée le{" "}
                      {filteredPhotos[
                        currentPhotoIndex
                      ].date.toLocaleDateString("fr-FR", {
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
