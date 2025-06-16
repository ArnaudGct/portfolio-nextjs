import Link from "next/link";

export default function ButtonMain({
  icon,
  children,
  size = "base",
  link = "#",
  newTab,
  className = "",
  type, // s'il est défini = bouton, sinon = lien
  onClick, // permet de gérer un clic direct
}) {
  const hasChildren = Boolean(children);

  // Padding uniforme si uniquement une icône
  const paddingClass = {
    sm: "p-2",
    base: "p-3",
    lg: "p-4",
  }[size];

  const paddingWithText = {
    sm: "px-5 py-1.5 lg:py-2.5",
    base: "px-6 md:px-14 py-2",
    lg: "px-5 py-3",
  }[size];

  const finalPadding = hasChildren ? paddingWithText : paddingClass;

  const sizeClass = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
  }[size];

  const classes = `group flex flex-row items-center justify-center ${
    hasChildren ? "gap-2" : ""
  } bg-blue-700 text-blue-50 rounded-lg hover:bg-blue-800 cursor-pointer transition duration-300 ${finalPadding} ${className}`;

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

  const animatedContent = hasChildren ? (
    <>
      {animatedIcon}
      <span className="relative inline-flex overflow-hidden px-1">
        <div
          className={`${sizeClass} block translate-y-0 skew-y-0 transition duration-500 group-hover:-translate-y-[130%] group-hover:skew-y-8`}
        >
          {children}
        </div>
        <div
          className={`${sizeClass} absolute top-0 left-0 translate-y-[130%] skew-y-8 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0`}
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

  // Si onClick est défini, on force le bouton
  if (type || onClick) {
    return (
      <button type={type || "button"} className={classes} onClick={onClick}>
        {animatedContent}
      </button>
    );
  }

  return (
    <Link
      href={link}
      target={newTab ? "_blank" : "_self"}
      className={className}
    >
      <button className={classes}>{animatedContent}</button>
    </Link>
  );
}
