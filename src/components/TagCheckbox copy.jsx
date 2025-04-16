import { motion, AnimatePresence } from "motion/react";

export default function TagCheckbox({ type, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(type)}
      className={`relative flex items-center gap-2 px-3 py-1 rounded-full text-xs transition 
        ${
          selected
            ? "bg-green-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
    >
      {/* Checkbox circle */}
      <span className="relative w-4 h-4 border rounded-full border-current flex-shrink-0">
        <AnimatePresence>
          {selected && (
            <motion.span
              className="absolute inset-1 rounded-full bg-white"
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
