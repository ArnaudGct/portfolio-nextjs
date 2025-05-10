import Image from "next/image";
import Link from "next/link";

export default function MediaCard({
  imageSrc,
  imageAlt,
  imageType = "cover", // "cover" = carré, "poster" = ratio affiche
  imageComponent, // Nouveau prop pour composant image personnalisé
  labelText,
  titleText,
  subtitleText,
  bgColor = "#1a66a5",
  borderColor = "#5e9eda",
  labelColor = "#ffffff",
  titleColor = "#ffffff",
  logoSrc,
  logoAlt,
  link = null,
  newTab = true,
  className = "", // Ajout de className pour pouvoir ajouter des classes depuis le parent
}) {
  // Dimensions de l'image selon le type
  const imageSize =
    imageType === "poster"
      ? { width: 1000, height: 1500 }
      : { width: 1000, height: 1000 };

  // Dimensions du conteneur d'image selon le type
  const containerDimensions =
    imageType === "poster"
      ? "h-[64px] w-[42px]" // Ratio 2:3 (poster)
      : "h-[64px] w-[64px]"; // Ratio 1:1 (carré)

  const content = (
    <div
      className={`flex justify-between items-center p-4 rounded-lg h-full ${
        link ? "hover:brightness-105 transition-all" : ""
      } ${className}`}
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Structure modifiée pour avoir le logo centré verticalement */}
      <div className="flex items-center gap-4 min-w-0 w-full">
        {/* Bloc de gauche: image */}
        <div
          className={`relative ${containerDimensions} overflow-hidden rounded-lg flex-shrink-0`}
        >
          {imageComponent ? (
            imageComponent
          ) : (
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={imageSize.width}
              height={imageSize.height}
              className="object-cover h-full w-full"
              style={{
                objectPosition:
                  imageType === "poster" ? "center 15%" : "center center",
              }}
            />
          )}
        </div>

        {/* Bloc central: contenu textuel avec flex-1 pour prendre l'espace disponible */}
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-rethink-sans"
            style={{ color: labelColor }}
          >
            {labelText}
          </p>
          <div className="min-w-0">
            <p
              className="text-lg font-rethink-sans font-bold truncate"
              style={{ color: titleColor }}
            >
              {titleText}
              {subtitleText && (
                <span className="ml-1 text-sm">- {subtitleText}</span>
              )}
            </p>
          </div>
        </div>

        {/* Bloc de droite: logo, centré verticalement */}
        {logoSrc && (
          <div className="flex items-center self-stretch pl-2">
            <Image
              src={logoSrc}
              alt={logoAlt || "Logo"}
              width={16}
              height={16}
              className="flex-shrink-0"
            />
          </div>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <Link
        href={link}
        target={newTab ? "_blank" : "_self"}
        rel={newTab ? "noopener noreferrer" : ""}
        className="block h-full"
      >
        {content}
      </Link>
    );
  }

  return content;
}
