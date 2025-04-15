export default function TagAvailable() {
  return (
    <div className=" flex gap-2 items-center border-green-300 bg-green-50 border px-2.5 py-0.5 rounded-full">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex size-2 rounded-full bg-green-500"></span>
      </span>
      <p className="text-green-500  text-sm font-medium font-rethink-sans">
        Disponible
      </p>
    </div>
  );
}
