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

  const buttonContent = (
    <button
      onClick={onClick}
      className={`flex flex-row items-center gap-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition duration-300 ${paddingClass} ${sizeClass} ${className} ${
        isDisabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {icon && <span>{icon}</span>}
      {children && <p>{children}</p>}
    </button>
  );

  if (link) {
    return (
      <Link
        href={link}
        target={newTab ? "_blank" : undefined}
        rel="noopener noreferrer"
      >
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}
