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
    sm: "px-3 py-1.5",
    base: "px-14 py-2",
    lg: "px-5 py-3",
  }[size];

  const finalPadding = hasChildren ? paddingWithText : paddingClass;

  const sizeClass = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
  }[size];

  const classes = `flex flex-row items-center justify-center ${
    hasChildren ? "gap-2" : ""
  } bg-blue-700 text-blue-50 rounded-lg hover:bg-blue-800 cursor-pointer transition duration-300 ${finalPadding} ${className}`;

  const content = (
    <>
      {icon && <span>{icon}</span>}
      {hasChildren && <p className={sizeClass}>{children}</p>}
    </>
  );

  // Si onClick est défini, on force le bouton
  if (type || onClick) {
    return (
      <button type={type || "button"} className={classes} onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <Link
      href={link}
      target={newTab ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className={className}
    >
      <button className={classes}>{content}</button>
    </Link>
  );
}
