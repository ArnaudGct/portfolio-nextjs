import Link from "next/link";

export default function Tag({ name, background, icon, href }) {
  const content = (
    <>
      {icon && <span>{icon}</span>}
      {name}
    </>
  );

  const baseClassName = `flex items-center text-blue-600 border border-blue-300 text-sm font-medium font-rethink-sans px-2.5 py-0.5 rounded-full ${
    background ? "bg-blue-50" : ""
  } ${icon ? "gap-2" : ""}`;

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        className={`${baseClassName} transition hover:opacity-80`}
      >
        {content}
      </Link>
    );
  }

  return <div className={baseClassName}>{content}</div>;
}
