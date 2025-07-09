"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function TagUtilities({
  logoSrc,
  logoAlt = "Logo",
  label,
  description = "",
  link = null,
  newTab = true,
  bgColor = "",
  bgColorDark = "",
  borderColor = "",
  borderColorDark = "",
  textColor = "",
  textColorDark = "",
  rounded = true,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Créer les styles CSS custom properties pour gérer le mode sombre
  const styleVars = {
    "--bg-color-light": bgColor,
    "--bg-color-dark": bgColorDark || bgColor,
    "--border-color-light": borderColor,
    "--border-color-dark": borderColorDark || borderColor,
    "--text-color-light": textColor,
    "--text-color-dark": textColorDark || textColor,
  };

  // Contenu du tag
  const tagContent = (
    <>
      {/* Image */}
      {logoSrc && (
        <div className="relative h-6 w-6 flex-shrink-0">
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={24}
            height={24}
            className={`h-full w-auto object-cover ${
              rounded ? "rounded-lg" : ""
            }`}
          />
        </div>
      )}

      {/* Nom du logiciel */}
      <p className="font-medium whitespace-nowrap overflow-hidden text-ellipsis [color:var(--text-color-light)] dark:[color:var(--text-color-dark)]">
        {label}
      </p>

      {/* Tooltip avec Framer Motion */}
      <AnimatePresence>
        {description && showTooltip && (
          <motion.div
            className="absolute z-10 w-max max-w-xs left-1/2 bottom-full mb-2 px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white text-sm rounded shadow-lg"
            initial={{ opacity: 0, y: 10, scale: 0.9, translateX: "-50%" }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              translateX: "-50%",
              transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
                duration: 0.3,
              },
            }}
            exit={{
              opacity: 0,
              y: 5,
              scale: 0.95,
              translateX: "-50%",
              transition: { duration: 0.2 },
            }}
          >
            {description}
            {/* Flèche */}
            <motion.div
              className="absolute left-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800 dark:border-t-slate-700"
              style={{ marginLeft: "-4px" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Rendu avec lien ou div simple selon la présence d'un lien
  if (link) {
    return (
      <Link
        href={link}
        target={newTab ? "_blank" : "_self"}
        rel={newTab ? "noopener noreferrer" : ""}
        className="relative inline-flex gap-2 items-center justify-center py-2 px-5 border rounded-full transition-transform hover:scale-105 [background-color:var(--bg-color-light)] [border-color:var(--border-color-light)] dark:[background-color:var(--bg-color-dark)] dark:[border-color:var(--border-color-dark)]"
        style={styleVars}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        {tagContent}
      </Link>
    );
  }

  return (
    <div
      className="relative inline-flex gap-2 items-center justify-center py-2 px-5 border rounded-full cursor-pointer [background-color:var(--bg-color-light)] [border-color:var(--border-color-light)] dark:[background-color:var(--bg-color-dark)] dark:[border-color:var(--border-color-dark)]"
      style={styleVars}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      {tagContent}
    </div>
  );
}
