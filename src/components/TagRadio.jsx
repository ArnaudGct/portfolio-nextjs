import { motion, AnimatePresence } from "motion/react";

export default function TagRadio({ type, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(type)}
      className={`relative flex items-center gap-2 px-3 py-1 rounded-lg text-normal font-medium transition font-rethink-sans cursor-pointer
        ${
          selected
            ? "bg-blue-100 text-blue-600"
            : "bg-white text-blue-600 hover:bg-blue-50"
        }`}
    >
      {/* Checkbox circle */}
      <span className="relative w-4 h-4 border rounded-full border-current flex-shrink-0">
        <AnimatePresence>
          {selected && (
            <motion.span
              className="absolute inset-1 rounded-full bg-blue-600"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          )}
        </AnimatePresence>
      </span>

      {/* Label */}
      {type}
    </button>
  );
}
