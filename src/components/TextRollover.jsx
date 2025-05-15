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
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${isActive ? "text-blue-700" : "text-blue-900"} ${className}`}
    >
      <li
        className="group overflow-hidden relative"
        style={{ height: `${itemHeight}px` }}
      >
        <span className="relative inline-flex overflow-hidden">
          <div
            className="translate-y-0 skew-y-0 transition duration-500 group-hover:-translate-y-[125%] group-hover:skew-y-8"
            style={{
              height: `${itemHeight}px`,
              display: "flex",
              alignItems: "center",
            }}
          >
            {text}
          </div>
          <div
            className="absolute top-0 left-0 translate-y-[125%] skew-y-8 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0"
            style={{
              height: `${itemHeight}px`,
              display: "flex",
              alignItems: "center",
            }}
          >
            {text}
          </div>
        </span>
      </li>
    </Link>
  );
}
