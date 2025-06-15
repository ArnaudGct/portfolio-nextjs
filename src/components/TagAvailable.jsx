import Link from "next/link";

export default function TagAvailable({ href }) {
  const content = (
    <>
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex size-2 rounded-full bg-green-500 dark:bg-green-400"></span>
      </span>
      <p className="text-green-500 dark:text-green-400 text-sm font-medium font-rethink-sans">
        Disponible
      </p>
    </>
  );

  const baseClassName =
    "flex gap-2 items-center border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-950/30 border px-2.5 py-0.5 rounded-full";

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
