"use client";

import { useState, useEffect } from "react";

export default function Toggl({ isChecked: initialChecked, setIsChecked }) {
  const [isChecked, setStateChecked] = useState(initialChecked);

  // Synchroniser l'état du toggle avec le prop 'isChecked'
  useEffect(() => {
    setStateChecked(initialChecked);
  }, [initialChecked]);

  const handleCheckboxChange = () => {
    const newValue = !isChecked;
    setStateChecked(newValue);
    setIsChecked(newValue); // Call the parent setter to update the external state
  };

  return (
    <label className="flex cursor-pointer select-none items-center scale-70">
      <div className="relative">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="sr-only"
        />
        <div
          className={`box block h-8 w-14 rounded-full ${
            isChecked ? "bg-slate-300" : "bg-blue-600"
          }`}
        ></div>
        <div
          className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 transition ${
            isChecked ? "" : "translate-x-full"
          }`}
        ></div>
      </div>
    </label>
  );
}
