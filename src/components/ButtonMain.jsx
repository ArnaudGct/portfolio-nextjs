import Link from "next/link";

export default function ButtonMain({
  icon,
  children,
  size = "base",
  link = "#",
  newTab,
  className = "",
  type = "button",
}) {
  const paddingClass = {
    sm: children ? "px-3 py-1.5" : "px-2.5 py-1.5",
    base: children ? "px-14 py-2" : "px-3 py-2",
    lg: children ? "px-5 py-3" : "px-3.5 py-3",
  }[size];

  const sizeClass = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
  }[size];

  const content = (
    <div
      className={`flex flex-row items-center justify-center gap-2 bg-blue-700 text-blue-50 rounded-lg hover:bg-blue-800 cursor-pointer transition duration-300 ${paddingClass} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children && <p className={sizeClass}>{children}</p>}
    </div>
  );

  if (type === "submit" || type === "button") {
    return (
      <button type={type} className="contents">
        {content}
      </button>
    );
  }

  return (
    <Link
      href={link}
      target={newTab ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className="contents"
    >
      {content}
    </Link>
  );
}
