export default function Tag({ name, background, icon }) {
  return (
    <div
      className={`flex items-center text-blue-600 border border-blue-300 text-sm font-medium font-rethink-sans px-2.5 py-0.5 rounded-full ${
        background ? "bg-blue-50" : ""
      } ${icon ? "gap-2" : ""}`}
    >
      {icon && <span>{icon}</span>}
      {name}
    </div>
  );
}
