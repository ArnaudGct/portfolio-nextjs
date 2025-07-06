import Image from "next/image";
import Link from "next/link";

export default function MediaCard({
  imageSrc,
  imageAlt,
  imageType = "cover",
  imageComponent,
  labelText,
  titleText,
  subtitleText,
  bgColor = "#FF6B6B",
  borderColor = "#FF8E8E",
  labelColor = "#FFB3B3",
  titleColor = "#FFFFFF",
  logoSrc,
  logoAlt,
  link,
  newTab = false,
  additionalContent,
  onMouseEnter,
  onMouseLeave,
  ...props
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

  return (
    <div className="w-full h-full" {...props}>
      {link ? (
        <a
          href={link}
          target={newTab ? "_blank" : "_self"}
          rel={newTab ? "noopener noreferrer" : ""}
          className="block w-full h-full"
        >
          <CardContent />
        </a>
      ) : (
        <CardContent />
      )}
    </div>
  );

  function CardContent() {
    return (
      <div
        className="relative w-full h-full rounded-lg p-3 flex items-center space-x-3 transition-all duration-300 group overflow-hidden"
        style={{
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Barre de slide au hover - même couleur que la bordure */}
        <div
          className="absolute top-0 left-0 h-full w-1 transition-all duration-500 ease-out group-hover:w-full group-hover:opacity-50"
          style={{
            backgroundColor: borderColor, // Utilise la même couleur que borderLeft
          }}
        />

        {/* Bloc de gauche: image */}
        <div
          className={`relative ${containerDimensions} overflow-hidden rounded-lg flex-shrink-0 z-10`}
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

        <div className="flex-1 min-w-0 flex flex-col justify-center z-10">
          {/* Texte de label */}
          <p
            className="text-sm font-rethink-sans leading-tight"
            style={{ color: labelColor }}
          >
            {labelText}
          </p>

          {/* Titre et sous-titre */}
          <div className="min-w-0">
            <p
              className="text-lg font-rethink-sans font-bold truncate leading-tight"
              style={{ color: titleColor }}
            >
              {titleText}
              {subtitleText && (
                <span className="ml-1 text-sm font-normal">
                  - {subtitleText}
                </span>
              )}
            </p>
          </div>

          {/* Contenu additionnel (barre de progression) */}
          {additionalContent && <div className="mt-1">{additionalContent}</div>}
        </div>

        {/* Bloc de droite: logo, centré verticalement */}
        {logoSrc && (
          <div className="hidden xs:flex items-center self-stretch pl-2 z-10">
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
    );
  }
}
