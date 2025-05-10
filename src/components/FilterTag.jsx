import { X } from "lucide-react";
import { motion } from "framer-motion";

export default function FilterTag({
  label,
  color = "slate",
  onRemove,
  isClearAll = false,
}) {
  const colorClasses = {
    green: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-300",
      hover: "hover:text-green-600 dark:hover:text-green-200",
    },
    yellow: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-800 dark:text-yellow-300",
      hover: "hover:text-yellow-600 dark:hover:text-yellow-200",
    },
    red: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-800 dark:text-red-300",
      hover: "hover:bg-red-200 dark:hover:bg-red-800/50",
    },
    slate: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-800 dark:text-slate-300",
      hover: "hover:bg-slate-200 dark:hover:bg-slate-700",
    },
  };

  const styles = colorClasses[color] || colorClasses.slate;

  return (
    <motion.div
      layout
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
