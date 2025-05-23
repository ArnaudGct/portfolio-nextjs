import Image from "next/image";
import Tag from "./../../components/Tag";
import TagAvailable from "./../../components/TagAvailable";
import { Cake, MapPin } from "lucide-react"; // Assurez-vous d'avoir installé lucide-react
import ButtonMain from "./../../components/ButtonMain";
import Link from "next/link";

export default function Presentation() {
  return (
    <section className="relative w-[90%] max-w-[1440px] mx-auto flex flex-col sm:flex-row gap-5 md:gap-8 items-start sm:items-center justify-center sm:justify-start">
      <div className="relative flex items-stretch h-[500px] lg:h-[350px] w-full sm:w-[70%] lg:w-[50%] lg:max-w-[350px]">
        {/* Définis une hauteur */}
        <Image
          src="/arnaud_graciet-accueil.webp"
          alt="Arnaud Graciet l'air surpris qui tient sa caméra et son objectif"
          fill
          className="object-cover object-[50%_15%] rounded-lg"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 350px"
          priority
        />

        {/* Crédit photo */}
        <Link
          href="https://www.instagram.com/amyr.mp5/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="absolute bottom-2 left-2 bg-blue-900/50 px-2 py-1 rounded text-xs text-white backdrop-blur-xs">
            <p>📸 Amir Metmati</p>
          </div>
        </Link>
      </div>
      <div className="flex flex-col gap-7 items-start w-full z-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col items-start justify-start">
            <p className="text-blue-400 text-xl font-normal font-rethink-sans">
              Arnaud
            </p>
            <p className="text-blue-700 text-5xl font-extrabold font-rethink-sans">
              Graciet
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TagAvailable />
            <Tag
              name="21 ans"
              background={true}
              icon={<Cake size={14} strokeWidth={1.75} />}
            />
            <Tag
              name="La Rochelle"
              background={true}
              icon={<MapPin size={14} strokeWidth={1.75} />}
            />
            <Tag name="monteur vidéo" background={false} />
            <Tag name="cadreur" background={false} />
          </div>
        </div>
        <div>
          <p className="text-blue-900 text-base font-normal font-outfit">
            En tant qu'étudiant passionné, j'ai toujours été attiré par des
            domaines variés tels que l'audiovisuel, le webdesign, et le
            développement web.
            <br />
            <br />
            Mon parcours m'a conduit à créer des vidéos captivantes sur YouTube,
            et au cœur de ce processus créatif, le montage vidéo s'est
            rapidement imposé comme ma spécialité et où j'ai acquis une
            expertise particulière.
          </p>
        </div>
        <ButtonMain
          link="/apropos"
          size="base"
          newTab={false}
          icon={false}
          className="w-full xs:w-auto"
        >
          En savoir plus
        </ButtonMain>
      </div>
      <div className="w-72 h-72 right-0 bottom-0 sm:top-0 z-1 absolute rounded-full bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_var(--blue-200,_#C5D3FF)_0%,_rgba(197,_211,_255,_0)_100%)] dark:bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_var(--blue-900,_#1E3A8A)_0%,_rgba(30,_58,_138,_0)_100%)] opacity-40 dark:opacity-30"></div>
    </section>
  );
}
