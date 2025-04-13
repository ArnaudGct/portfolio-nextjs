import DailymotionPlayer from "./DaylimotionPlayer";
import Tag from "../../components/Tag";
import TagAvailable from "../../components/TagAvailable";

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Arrière-plan : fond blanc + grille */}
      <div className="absolute z-12 top-0 left-0 w-full h-14 bg-gradient-to-t from-[#dfe7ff]/0 to-[#dfe7ff]/75"></div>
      <div
        className="absolute inset-0 z-9 bg-repeat bg-white"
        style={{
          backgroundImage: "url('/grille.svg')",
        }}
      />

      {/* Vidéo */}
      <div className="absolute left-0 top-[64px] w-full h-[calc(100vh-64px)] z-10">
        <DailymotionPlayer />
      </div>

      {/* "Faux trou" = texte + copie de la grille + fond blanc */}
      <div
        className="absolute top-[64px] left-0 bg-white z-11 px-10 pb-4 pt-2 rounded-br-lg"
        style={{
          backgroundImage: "url('/grille.svg')",
          backgroundRepeat: "repeat",
          backgroundPosition: "0 -64px", // raccord parfait avec le fond
        }}
      >
        <div className="flex flex-col gap-2 items-start justify-center">
          <div className="flex items-center gap-2">
            <TagAvailable />
            <Tag name="monteur vidéo" background="false" />
            <Tag name="cadreur" background="false" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-blue-900 font-rethink-sans">
              Hey, je suis{" "}
              <span className="font-covered-by-your-grace font-normal text-blue-600">
                Arnaud Graciet
              </span>
            </h1>
            <h2 className="text-lg font-normal text-blue-900">
              Imaginons ensemble votre{" "}
              <span className="font-semibold text-blue-600">
                prochaine vidéo
              </span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
