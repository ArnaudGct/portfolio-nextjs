import Image from "next/image";
import ButtonMain from "./../../src/components/ButtonMain";
import { ArrowUpRight, Cake } from "lucide-react";
import Tag from "./../../src/components/Tag";
import TagAvailable from "./../../src/components/TagAvailable";
import MediaCard from "./../../src/components/MediaCard";
import TagUtilities from "./../../src/components/TagUtilities";

export default function APropos() {
  return (
    <main className="">
      <div className="mt-24 mb-20">
        <div className="flex gap-10 max-w-[1440px] mx-auto w-[90%]">
          <div className="flex flex-col gap-4 max-w-72 w-full">
            <div className="flex flex-col rounded-lg">
              <div className="relative flex items-stretch h-[500px] lg:h-[350px] w-full">
                <Image
                  src="/arnaud_graciet-apropos.webp"
                  alt="Arnaud Graciet l'air surpris qui tient sa caméra et son objectif"
                  fill
                  className="object-cover object-[50%_15%] rounded-t-lg border-x border-t border-blue-300"
                  priority // optionnel : pour le chargement immédiat
                />
              </div>
              <div className="flex flex-col gap-4 p-5 bg-blue-50 rounded-b-lg border-x border-b border-blue-300">
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
                </div>
              </div>
            </div>
            <ButtonMain
              icon={<ArrowUpRight size={16} />}
              link="/journal_personnel"
              newTab={false}
              size="base"
              className="w-full xs:w-auto"
            >
              Journal personnel
            </ButtonMain>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-4">
              <p className="text-blue-600 text-3xl font-extrabold font-rethink-sans">
                Qui suis-je ?
              </p>
              <p className="text-blue-900">
                Passionné par le multimédia et la création de contenu, j’explore
                sans cesse de nouvelles façons d’allier technologie et
                créativité. Mon parcours a commencé sur YouTube avec des vidéos
                sur l’espace, où j’ai découvert ma passion pour le montage
                vidéo.
                <br />
                <br />
                Aujourd’hui, je propose mes services en tant que{" "}
                <span className="text-blue-600">monteur vidéo freelance</span>,
                collaborant sur des projets variés à distance. Également{" "}
                <span className="text-blue-600">cadreur à La Rochelle</span>, je
                peux réaliser des prises de vue sur place avant d’assurer le
                montage pour offrir des vidéos complètes et de qualité.
                <br />
                <br />
                Curieux et polyvalent,{" "}
                <span className="text-blue-600">j’aime toucher à tout</span> :
                audiovisuel, graphisme, communication digitale… Toujours prêt à
                relever de nouveaux défis !
              </p>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-4 items-stretch h-52">
              {/* MAP - colonne 1 sur deux lignes */}
              <div className="relative overflow-hidden w-full h-full rounded-lg border border-blue-300 col-start-1 row-start-1 col-span-1 row-span-2">
                <img
                  src="https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/-1.1519041,46.1568242,12/400x300?access_token=pk.eyJ1IjoibGFyZWZhc3RybyIsImEiOiJjbTlpejFibDcwNXpxMmtzYmZxdW1nODk0In0.AHV1GODjHroWMOUaWaIwmQ"
                  alt="Map"
                  className="object-cover object-center w-full h-full rounded-lg"
                />
                <div className="absolute bottom-2 left-4 flex flex-col items-start z-10">
                  <p className="text-sm text-blue-300 font-rethink-sans">
                    J'habite à
                  </p>
                  <p className="text-blue-50 font-bold text-lg font-rethink-sans">
                    La Rochelle
                  </p>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#4e4aec]/0 to-[#4e4aec] z-5"></div>
              </div>

              {/* MediaCard 1 - haut droite */}
              <div className="col-start-2 row-start-1 h-full self-stretch">
                <MediaCard
                  imageSrc="/apocalypse.webp"
                  imageAlt="Pochette d'album d'Apocalypse"
                  imageType="cover"
                  labelText="Son du moment"
                  titleText="Nanani Nanana"
                  bgColor="#a52a1a"
                  borderColor="#ff6a6a"
                  labelColor="#ffa2a2"
                  titleColor="#FFEDED"
                  logoSrc="/spotify.webp"
                  logoAlt="Logo de Spotify"
                />
              </div>

              {/* MediaCard 2 - bas droite */}
              <div className="col-start-2 row-start-2 h-full self-stretch">
                <MediaCard
                  imageSrc="/interstellar.webp"
                  imageAlt="Affiche d'Interstellar"
                  imageType="poster"
                  labelText="Film préféré"
                  titleText="Interstellar"
                  bgColor="#1a66a5"
                  borderColor="#5e9eda"
                  labelColor="#a2dbff"
                  titleColor="#edf3ff"
                  logoSrc="/letterboxd.webp"
                  logoAlt="Letterboxd"
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 border border-slate-300 rounded-lg p-6 bg-slate-50">
              <div className="flex flex-col">
                <p className="text-slate-900 text-2xl font-extrabold font-rethink-sans">
                  Avec quoi je travaille ?
                </p>
                <p className="text-slate-400 text-base font-normal">
                  Les outils de post-production et d'organisation me permettant
                  de travailler de façon créative et efficace.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 items-center justify-start">
                <TagUtilities
                  logoSrc="/premiere_pro.webp"
                  logoAlt="Logo Premiere Pro"
                  label="Première Pro"
                  description="Montage vidéo professionnel."
                  bgColor="#edf3ff"
                  borderColor="#a2b5ff"
                  textColor="#4e4aec"
                  rounded={false}
                />

                <TagUtilities
                  logoSrc="/after_effects.webp"
                  logoAlt="Logo After Effects"
                  label="After Effects"
                  description="Création d'effets spéciaux et animation graphique."
                  bgColor="#edf3ff"
                  borderColor="#a2b5ff"
                  textColor="#4e4aec"
                  rounded={false}
                />

                <TagUtilities
                  logoSrc="/artlist.webp"
                  logoAlt="Logo Artlist"
                  label="Artlist"
                  description="Musique libre de droits pour créateurs."
                  bgColor="#fffeed"
                  borderColor="#ffe6a2"
                  textColor="#ecae4a"
                  rounded={true}
                />

                <TagUtilities
                  logoSrc="/figma.webp"
                  logoAlt="Logo de Figma"
                  label="Figma"
                  description="Design collaboratif et prototypage."
                  bgColor="#ffeeed"
                  borderColor="#ffa5a2"
                  textColor="#ec4a4a"
                  rounded={false}
                />

                <TagUtilities
                  logoSrc="/eagle.webp"
                  logoAlt="Logo de Eagle"
                  label="Eagle"
                  description="Gestion de fichiers pour designers."
                  bgColor="#e8f3ff"
                  borderColor="#66a9f9"
                  textColor="#3186ff"
                  rounded={true}
                />

                <TagUtilities
                  logoSrc="/notion.webp"
                  logoAlt="Logo de Notion"
                  label="Notion"
                  description="Prise de notes et gestion de projets."
                  bgColor="#f8fafc"
                  borderColor="#cbd5e1"
                  textColor="#475569"
                  rounded={false}
                />

                <TagUtilities
                  logoSrc="/toggl_track.webp"
                  logoAlt="Logo de Toggl Track"
                  label="Toggl Track"
                  description="Suivi du temps pour la productivité."
                  bgColor="#ffedff"
                  borderColor="#ffa2d2"
                  textColor="#ec4abb"
                  rounded={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
