import Link from "next/link";

export default function ButtonSecondary({
  icon,
  children,
  onClick,
  size,
  link,
  newTab,
  className = "",
  isDisabled = false,
}) {
  const paddingClass = children ? "px-4 py-2" : "px-2.5 py-2.5";
  const sizeClass =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";

  const classes = `group flex flex-row items-center gap-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition duration-300 ${paddingClass} ${sizeClass} ${className} ${
    isDisabled ? "cursor-not-allowed" : "cursor-pointer"
  }`;

  // Animation pour l'icône si elle est présente
  const animatedIcon = icon && (
    <div className="relative flex items-center justify-center h-5 w-5 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-400 group-hover:-translate-y-full">
        {icon}
      </div>
      <div className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-400 group-hover:translate-y-0">
        {icon}
      </div>
    </div>
  );

  // Animation pour le texte si présent
  const animatedContent = children ? (
    <>
      {animatedIcon}
      <span className="relative inline-flex overflow-hidden px-1">
        <div
          className={`block translate-y-0 skew-y-0 transition duration-500 group-hover:-translate-y-[130%] group-hover:skew-y-8`}
        >
          {children}
        </div>
        <div
          className={`absolute top-0 left-0 translate-y-[130%] skew-y-8 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0`}
        >
          {children}
        </div>
      </span>
    </>
  ) : (
    <>
      {animatedIcon || (
        <span className="flex items-center justify-center">{icon}</span>
      )}
    </>
  );

  // If we have a link, render the component as a Link
  if (link) {
    return (
      <Link
        href={link}
        target={newTab ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className={classes}
        onClick={onClick}
      >
        {animatedContent}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} disabled={isDisabled}>
      {animatedContent}
    </button>
  );
}
