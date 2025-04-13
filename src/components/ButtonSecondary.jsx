import Link from "next/link";

export default function ButtonSecondary({
  icon,
  children,
  onClick,
  size,
  link,
  newTab,
}) {
  // Déterminer padding selon children
  const paddingClass = children ? "px-4 py-2" : "px-2.5 py-2.5";

  // Déterminer taille du texte selon size
  const sizeClass =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base"; // par défaut
  return (
    <Link href={link} target={newTab && "_blank"} rel="noopener noreferrer">
      <button
        onClick={onClick}
        className={`flex flex-row items-center gap-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 cursor-pointer transition duration-300 ${paddingClass}`}
      >
        {icon && <span>{icon}</span>}
        {children && <p className={sizeClass}>{children}</p>}
      </button>
    </Link>
  );
}
