"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"; // Corrige aussi `motion/react` en `framer-motion`
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import ButtonSecondary from "../../../components/ButtonSecondary"; // ou adapte le chemin
import ButtonMain from "../../../components/ButtonMain"; // idem
import Tag from "../../../components/Tag"; // idem

export default function AlbumsGallery({ album }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);

  console.log("Album dans AlbumsGallery:", album);

  const photos = album.photos_albums_link.map((p) => p.photos);

  const handleImageClick = (index) => {
    setCurrentPhotoIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPhotoIndex(null);
  };

  const handleNextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <section>
      <div>
        {/* Navigation et en-tête */}

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
            {album.photos_albums_link.map((photoLink, index) => (
              // <div
              //   key={index}
              //   className="group block relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
              //   onClick={() => handleImageClick(index)}
              // >
              //   <div className="aspect-square relative overflow-hidden">
              //     <Image
              //       src={photoLink.photos.lien_low}
              //       alt={`Photo ${index + 1} de l'album ${album.titre}`}
              //       fill
              //       sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              //       className="object-cover transition-transform duration-500 group-hover:scale-105"
              //       placeholder="blur"
              //       blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjwvc3ZnPg=="
              //     />
              //     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              //     <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              //       <span className="text-sm font-medium">Voir les détails</span>
              //     </div>
              //   </div>
              // </div>
              <motion.div
                key={`photo-${photoLink.photos.id_pho}`}
                variants={{
                  hidden: { opacity: 0, scale: 0.9, y: 20 },
                  visible: { opacity: 1, scale: 1, y: 0 },
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="group cursor-pointer overflow-hidden rounded-lg"
                onClick={() => handleImageClick(index)}
              >
                <Image
                  src={photoLink.photos.lien_low}
                  alt={`Photo ${index + 1} de l'album ${album.titre}`}
                  width={500}
                  height={300}
                  className="w-full h-auto object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                />
              </motion.div>
            ))}
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
                  className="w-full h-full flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  key={`photo-${currentPhotoIndex}`}
                >
                  <Image
                    src={photos[currentPhotoIndex].lien_high}
                    alt="bibou"
                    width={1200}
                    height={800}
                    className="max-w-full max-h-[calc(90vh-10rem)] object-contain"
                    priority
                  />
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

              <div className="p-4 bg-white border-t border-gray-200">
                {/* <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, tagIndex) => (
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
                  ))}
                </div> */}

                <div className="justify-between items-center mt-4 text-sm text-gray-500 md:flex hidden">
                  <p className="text-blue-600 font-medium">
                    {currentPhotoIndex + 1} / {photos.length}
                  </p>
                  {photos[currentPhotoIndex].date_ajout && (
                    <p className="text-blue-300">
                      Ajoutée le{" "}
                      {photos[currentPhotoIndex].date_ajout.toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Modal, navigation etc. ici avec AnimatePresence */}
      {/* Tu réutilises le code existant que tu as déjà écrit pour le modal */}
    </section>
  );
}
