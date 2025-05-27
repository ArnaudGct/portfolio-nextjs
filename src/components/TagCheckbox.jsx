import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react"; // facultatif, pour une icône check

export default function TagCheckbox({ type, count, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(type)}
      className={`relative border border-blue-300 flex items-center gap-2 px-3 py-1 font-medium rounded-lg text-sm font-rethink-sans cursor-pointer transition
        ${
          selected
            ? "bg-blue-100 text-blue-600"
            : "bg-white text-blue-600 hover:bg-blue-50"
        }`}
    >
      {/* Case à cocher style carré */}
      <span className="relative w-4 h-4 border text-blue-700 border-blue-300 rounded-sm flex items-center justify-center bg-white">
        <AnimatePresence>
          {selected && (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Check size={12} />
            </motion.div>
          )}
        </AnimatePresence>
      </span>

      {/* Label */}
      <span>{type}</span>

      {/* Badge de comptage amélioré */}
      <span
        className={`text-xs font-semibold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center border transition-all duration-200 ${
          selected
            ? "bg-blue-600 text-blue-50 border-blue-600"
            : "bg-blue-100 text-blue-600 border-blue-200"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
