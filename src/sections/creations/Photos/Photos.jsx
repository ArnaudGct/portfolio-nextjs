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
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAlbumsLoading, setIsAlbumsLoading] = useState(true);
  const [isVisuallyLoading, setIsVisuallyLoading] = useState(true);
  const [isAlbumsVisuallyLoading, setIsAlbumsVisuallyLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);

  const [albumImageLoadingStates, setAlbumImageLoadingStates] = useState({});
  const [photoLoadingState, setPhotoLoadingState] = useState({});

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

    // IMPORTANT: Réinitialiser les états de chargement des images individuelles
    // pour les éléments déjà chargés
    setAlbumImageLoadingStates({});
    setPhotoLoadingState({});
  };

  // Modifier le useEffect de filtrage pour réinitialiser d'abord puis définir les nouveaux états
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

    // Utiliser setTimeout pour s'assurer que cette partie s'exécute APRÈS le rendu
    setTimeout(() => {
      // Initialiser les états de chargement pour les nouveaux éléments filtrés
      if (resultAlbums.length > 0) {
        const initialLoadingState = {};
        resultAlbums.forEach((album) => {
          initialLoadingState[album.id_alb] = {};
          for (let i = 0; i < 5; i++) {
            // Marquer comme non chargé seulement si la photo existe
            initialLoadingState[album.id_alb][i] = album.photos[i]
              ? false
              : false;
          }
        });
        setAlbumImageLoadingStates(initialLoadingState);
      }

      if (resultPhotos.length > 0) {
        const initialPhotoLoadingState = {};
        resultPhotos.forEach((photo) => {
          // Considérer les photos comme déjà chargées (false) après le filtrage
          initialPhotoLoadingState[photo.id_pho] = false;
        });
        setPhotoLoadingState(initialPhotoLoadingState);
      }
    }, 0);
  }, [photos, albums, selectedTags, searchQuery]);

  // 3. Modifiez la fonction de gestion du chargement des images d'album
  const handleAlbumImageLoad = (albumId, photoIndex) => {
    setAlbumImageLoadingStates((prev) => {
      // Vérification de sécurité : si l'album n'existe pas dans l'état ou a été filtré
      if (!prev || !prev[albumId]) {
        return prev;
      }

      // Marque cette image spécifique comme chargée (false = chargée)
      return {
        ...prev,
        [albumId]: {
          ...prev[albumId],
          [photoIndex]: false,
        },
      };
    });
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
            {isVisuallyLoading || isAlbumsVisuallyLoading ? (
              <>
                <div className="h-8 w-48 bg-blue-100/40 rounded-md mb-2"></div>
                <div className="h-6 w-72 bg-blue-100/40 rounded-md"></div>
              </>
            ) : (
              <>
                <p className="text-2xl font-extrabold font-rethink-sans text-blue-600">
                  {filteredAlbums.length > 0 && (
                    <>
                      <NumberFlow value={filteredAlbums.length} /> album
                      {filteredAlbums.length > 1 ? "s" : ""}
                      {filteredPhotos.length > 0 && " et "}
                    </>
                  )}
                  {filteredPhotos.length > 0 && (
                    <>
                      <NumberFlow value={filteredPhotos.length} /> photo
                      {filteredPhotos.length > 1 ? "s" : ""}
                    </>
                  )}{" "}
                  disponible
                  {filteredAlbums.length + filteredPhotos.length > 1 ? "s" : ""}
                </p>
                <p className="text-lg text-blue-900">{getLastAdded()}</p>
              </>
            )}
          </div>
          <div className="w-full md:w-auto relative">
            <div className="flex">
              <input
                type="text"
                placeholder="Rechercher une photo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 bg-slate-200 dark:bg-blue-50 dark:text-blue-950 dark:placeholder:text-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 md:w-64 lg:w-96"
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
                          <div className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105">
                            <div className="w-full h-full grid grid-cols-3 xs:grid-cols-2 md:grid-cols-3 grid-rows-2 gap-0.5 p-0.5 rounded-lg overflow-hidden">
                              {/* Photo 1 – grande image, colonne de gauche (2 lignes) */}
                              {album.photos[0] && (
                                <div className="col-span-1 row-span-2 relative rounded-tl-lg rounded-bl-lg overflow-hidden">
                                  {/* Skeleton qui disparaît une fois l'image chargée */}
                                  {albumImageLoadingStates[
                                    album.id_alb
                                  ]?.[0] && (
                                    <div className="absolute inset-0 z-10 bg-blue-100/60 animate-pulse"></div>
                                  )}
                                  <Image
                                    src={album.photos[0].lien_low}
                                    alt={album.photos[0].alt}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className={`object-cover rounded-tl-lg rounded-bl-lg${
                                      albumImageLoadingStates[album.id_alb]?.[0]
                                        ? "opacity-0"
                                        : "opacity-100 transition-opacity duration-300"
                                    }`}
                                    onLoad={() =>
                                      handleAlbumImageLoad(album.id_alb, 0)
                                    }
                                  />
                                </div>
                              )}

                              {/* Photo 2 – colonne droite ligne 1 */}
                              {album.photos[1] && (
                                <div className="col-span-1 row-span-1 relative overflow-hidden rounded-tr-none xs:rounded-tr-lg md:rounded-tr-none">
                                  {albumImageLoadingStates[
                                    album.id_alb
                                  ]?.[1] && (
                                    <div className="absolute inset-0 z-10 bg-blue-100/60 animate-pulse"></div>
                                  )}
                                  <Image
                                    src={album.photos[1].lien_low}
                                    alt={album.photos[1].alt}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className={`object-cover rounded-tr-none xs:rounded-tr-lg md:rounded-tr-none ${
                                      albumImageLoadingStates[album.id_alb]?.[1]
                                        ? "opacity-0"
                                        : "opacity-100 transition-opacity duration-300"
                                    }`}
                                    onLoad={() =>
                                      handleAlbumImageLoad(album.id_alb, 1)
                                    }
                                  />
                                </div>
                              )}

                              {/* Photo 3 – colonne droite ligne 2 */}
                              {album.photos[2] && (
                                <div className="col-span-1 row-span-1 relative rounded-br-none rounded-tr-lg xs:rounded-br-lg xs:rounded-tr-none md:rounded-br-none md:rounded-tr-lg overflow-hidden">
                                  {albumImageLoadingStates[
                                    album.id_alb
                                  ]?.[2] && (
                                    <div className="absolute inset-0 z-10 bg-blue-100/60 animate-pulse"></div>
                                  )}
                                  <Image
                                    src={album.photos[2].lien_low}
                                    alt={album.photos[2].alt}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className={`object-cover rounded-br-none rounded-tr-lg xs:rounded-br-lg xs:rounded-tr-none md:rounded-br-none md:rounded-tr-lg ${
                                      albumImageLoadingStates[album.id_alb]?.[2]
                                        ? "opacity-0"
                                        : "opacity-100 transition-opacity duration-300"
                                    }`}
                                    onLoad={() =>
                                      handleAlbumImageLoad(album.id_alb, 2)
                                    }
                                  />
                                </div>
                              )}

                              {/* Photo 4 – affichée uniquement en md+ */}
                              {album.photos[3] && (
                                <div className="block xs:hidden md:block col-span-1 row-span-1 relative rounded-tr-none xs:rounded-tr-br md:rounded-tr-none overflow-hidden">
                                  {albumImageLoadingStates[
                                    album.id_alb
                                  ]?.[3] && (
                                    <div className="absolute inset-0 z-10 bg-blue-100/60 animate-pulse"></div>
                                  )}
                                  <Image
                                    src={album.photos[3].lien_low}
                                    alt={album.photos[3].alt}
                                    fill
                                    priority
                                    sizes="25vw"
                                    className={`object-cover rounded-tr-none xs:rounded-tr-br md:rounded-tr-none ${
                                      albumImageLoadingStates[album.id_alb]?.[3]
                                        ? "opacity-0"
                                        : "opacity-100 transition-opacity duration-300"
                                    }`}
                                    onLoad={() =>
                                      handleAlbumImageLoad(album.id_alb, 3)
                                    }
                                  />
                                </div>
                              )}

                              {/* Photo 5 – affichée uniquement en md+ */}
                              {album.photos[4] && (
                                <div className="block xs:hidden md:block col-span-1 row-span-1 relative rounded-br-lg xs:rounded-br-none md:rounded-br-lg overflow-hidden">
                                  {albumImageLoadingStates[
                                    album.id_alb
                                  ]?.[4] && (
                                    <div className="absolute inset-0 z-10 bg-blue-100/60 animate-pulse"></div>
                                  )}
                                  <Image
                                    src={album.photos[4].lien_low}
                                    alt={album.photos[4].alt}
                                    fill
                                    priority
                                    sizes="25vw"
                                    className={`object-cover rounded-br-lg xs:rounded-br-none md:rounded-br-lg ${
                                      albumImageLoadingStates[album.id_alb]?.[4]
                                        ? "opacity-0"
                                        : "opacity-100 transition-opacity duration-300"
                                    }`}
                                    onLoad={() =>
                                      handleAlbumImageLoad(album.id_alb, 4)
                                    }
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
                    priority
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
                  className="w-full h-full flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  key={`photo-${currentPhotoIndex}`}
                >
                  <Image
                    src={filteredPhotos[currentPhotoIndex].lien_high}
                    alt={filteredPhotos[currentPhotoIndex].alt}
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
                className="p-4 bg-white border-t border-slate-200"
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
                  className="justify-between items-center mt-4 text-sm text-slate-500 md:flex hidden"
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
