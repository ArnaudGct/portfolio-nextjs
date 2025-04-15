import Image from "next/image";

export default function MediaCard({
  imageSrc,
  imageAlt,
  imageType = "cover", // "cover" = carré, "poster" = ratio affiche
  labelText,
  titleText,
  bgColor = "#1a66a5",
  borderColor = "#5e9eda",
  labelColor = "#ffffff",
  titleColor = "#ffffff",
  logoSrc,
  logoAlt,
}) {
  const imageSize =
    imageType === "poster"
      ? { width: 1000, height: 1500 }
      : { width: 1000, height: 1000 };

  return (
    <div
      className="flex justify-between items-center p-4 rounded-lg h-full"
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="w-full flex items-center gap-4">
        <div className="relative h-[64px] w-auto">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={imageSize.width}
            height={imageSize.height}
            className="h-full w-auto object-cover object-[50%_15%] rounded-lg"
          />
        </div>
        <div>
          <p
            className="text-sm font-rethink-sans"
            style={{ color: labelColor }}
          >
            {labelText}
          </p>
          <p
            className="text-lg font-bold font-rethink-sans"
            style={{ color: titleColor }}
          >
            {titleText}
          </p>
        </div>
      </div>
      {logoSrc && (
        <Image src={logoSrc} alt={logoAlt || "Logo"} width={16} height={16} />
      )}
    </div>
  );
}
