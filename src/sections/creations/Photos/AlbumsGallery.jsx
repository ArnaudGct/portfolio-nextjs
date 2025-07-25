"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X, Loader2 } from "lucide-react";
import ButtonSecondary from "../../../components/ButtonSecondary";
import ButtonMain from "../../../components/ButtonMain";
import Tag from "../../../components/Tag";

export default function AlbumsGallery({ album }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);
  const [loadingImages, setLoadingImages] = useState({});
  const [modalImageLoading, setModalImageLoading] = useState(true);
  const [highResLoaded, setHighResLoaded] = useState(false);

  // Bloquer le scroll quand la modal est ouverte
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Nettoyer au démontage du composant
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const photos = album.photos_albums_link.map((p) => p.photos);

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
    if (currentPhotoIndex < photos.length - 1) {
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

  const handleImageLoad = (id) => {
    setLoadingImages((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const handleLowResLoad = () => {
    setModalImageLoading(false);
  };

  const handleHighResLoad = () => {
    setHighResLoaded(true);
  };

  return (
    <section>
      <div>
        {/* Galerie de photos */}
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
            {photos.map((photoLink, index) => {
              // Initialiser l'état de chargement pour cette image si ce n'est pas déjà fait
              const photoId = photoLink.id_pho || `index-${index}`;

              if (loadingImages[photoId] === undefined) {
                setLoadingImages((prev) => ({
                  ...prev,
                  [photoId]: true,
                }));
              }

              return (
                <motion.div
                  key={`photo-${photoId}`}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9, y: 20 },
                    visible: { opacity: 1, scale: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="group cursor-pointer overflow-hidden rounded-lg relative"
                  onClick={() => handleImageClick(index)}
                >
                  {/* Spinner pour les images de la grille */}
                  {loadingImages[photoId] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg z-10">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    </div>
                  )}

                  <Image
                    src={photoLink.lien_low}
                    alt={photoLink.alt}
                    width={Math.floor((photoLink.largeur || 300) / 4)}
                    height={Math.floor((photoLink.hauteur || 200) / 4)}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    priority={false}
                    className={`w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105 ${
                      loadingImages[photoId]
                        ? "opacity-0"
                        : "opacity-100 transition-opacity duration-300"
                    }`}
                    onLoad={() => handleImageLoad(photoId)}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

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
                    src={photos[currentPhotoIndex].lien_low}
                    alt={photos[currentPhotoIndex].alt}
                    width={Math.floor(photos[currentPhotoIndex].largeur / 4)}
                    height={Math.floor(photos[currentPhotoIndex].hauteur / 4)}
                    className={`max-w-[90%] max-h-[calc(90vh-10rem)] object-contain absolute ${
                      modalImageLoading
                        ? "opacity-0"
                        : highResLoaded
                          ? "opacity-0 transition-opacity duration-500"
                          : "opacity-100 transition-opacity duration-300"
                    }`}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    priority={false}
                    onLoad={handleLowResLoad}
                  />

                  {/* Image haute résolution - se superpose */}
                  {!modalImageLoading && (
                    <Image
                      src={photos[currentPhotoIndex].lien_high}
                      alt={photos[currentPhotoIndex].alt}
                      width={Math.floor(photos[currentPhotoIndex].largeur / 2)}
                      height={Math.floor(photos[currentPhotoIndex].hauteur / 2)}
                      className={`max-w-[90%] max-h-[calc(90vh-10rem)] object-contain absolute ${
                        highResLoaded
                          ? "opacity-100 transition-opacity duration-500"
                          : "opacity-0"
                      }`}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      priority={false}
                      onLoad={handleHighResLoad}
                    />
                  )}
                </motion.div>

                <motion.div
                  disabled={currentPhotoIndex === photos.length - 1}
                  className={`absolute right-4 z-10 hidden md:flex items-center justify-center`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={
                    currentPhotoIndex !== photos.length - 1
                      ? { scale: 1.1 }
                      : {}
                  }
                  whileTap={
                    currentPhotoIndex !== photos.length - 1
                      ? { scale: 0.9 }
                      : {}
                  }
                >
                  <ButtonSecondary
                    onClick={handleNextPhoto}
                    isDisabled={currentPhotoIndex === photos.length - 1}
                    icon={<ArrowRight size={20} strokeWidth={1.75} />}
                    className={` 
                     ${
                       currentPhotoIndex === photos.length - 1
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
                  {currentPhotoIndex + 1} / {photos.length}
                </span>

                <motion.div
                  disabled={currentPhotoIndex === photos.length - 1}
                  className={`flex items-center justify-center`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={
                    currentPhotoIndex !== photos.length - 1
                      ? { scale: 1.05 }
                      : {}
                  }
                  whileTap={
                    currentPhotoIndex !== photos.length - 1
                      ? { scale: 0.95 }
                      : {}
                  }
                >
                  <ButtonSecondary
                    onClick={handleNextPhoto}
                    isDisabled={currentPhotoIndex === photos.length - 1}
                    icon={<ArrowRight size={20} strokeWidth={1.75} />}
                    className={` 
                     ${
                       currentPhotoIndex === photos.length - 1
                         ? "opacity-40"
                         : "opacity-100"
                     }`}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
