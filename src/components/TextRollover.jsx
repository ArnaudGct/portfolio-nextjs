"use client";

import Link from "next/link";

export default function TextRollover({
  href,
  text,
  isActive,
  className = "",
  itemHeight = 28,
  onClick = null,
}) {
  // Calcul de la translation pour 3 éléments
  const translationValue = -(itemHeight * 2);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${isActive ? "text-blue-700" : "text-blue-900"} ${className}`}
    >
      <li
        className={`overflow-hidden relative`}
        style={{ height: `${itemHeight}px` }}
      >
        <div
          className="flex flex-col transition-transform duration-300 ease-out will-change-transform transform-gpu"
          style={{
            transform: "translateY(0)",
            transition: "transform 0.3s ease-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = `translateY(${translationValue}px)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span
            style={{
              height: `${itemHeight}px`,
              display: "flex",
              alignItems: "center",
            }}
          >
            {text}
          </span>
          <span
            style={{
              height: `${itemHeight}px`,
              display: "flex",
              alignItems: "center",
            }}
          >
            {text}
          </span>
          <span
            style={{
              height: `${itemHeight}px`,
              display: "flex",
              alignItems: "center",
            }}
          >
            {text}
          </span>
        </div>
      </li>
    </Link>
  );
}
