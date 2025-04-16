import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react"; // facultatif, pour une icône check

export default function TagCheckbox({ type, selected, onToggle }) {
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
      {type}
    </button>
  );
}
