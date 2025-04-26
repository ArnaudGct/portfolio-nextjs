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

  const classes = `flex flex-row items-center gap-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition duration-300 ${paddingClass} ${sizeClass} ${className} ${
    isDisabled ? "cursor-not-allowed" : "cursor-pointer"
  }`;

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
        {icon && <span>{icon}</span>}
        {children && <p>{children}</p>}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} disabled={isDisabled}>
      {icon && <span>{icon}</span>}
      {children && <p>{children}</p>}
    </button>
  );
}
