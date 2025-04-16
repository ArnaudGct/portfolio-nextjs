import { X } from "lucide-react";
import { motion } from "framer-motion"; // Corrigé le chemin ici aussi !

export default function FilterTag({
  label,
  color = "gray",
  onRemove,
  isClearAll = false,
}) {
  const colorClasses = {
    green: {
      bg: "bg-green-100",
      text: "text-green-800",
      hover: "hover:text-green-600",
    },
    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      hover: "hover:text-yellow-600",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-800",
      hover: "hover:bg-red-200",
    },
    gray: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      hover: "hover:bg-gray-200",
    },
  };

  const styles = colorClasses[color] || colorClasses.gray;

  return (
    <motion.div
      layout // <--- Ajout magique ici
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onRemove}
      className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 cursor-pointer
        ${styles.bg} ${styles.text} ${styles.hover} transition-colors duration-200`}
    >
      <p className="whitespace-nowrap">{label}</p>
      {onRemove && !isClearAll && (
        <X size={14} strokeWidth={1.75} className="ml-1" />
      )}
    </motion.div>
  );
}
