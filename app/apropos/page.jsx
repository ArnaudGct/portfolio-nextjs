import Image from "next/image";
import ButtonMain from "./../../src/components/ButtonMain";
import { ArrowUpRight, Cake } from "lucide-react";
import Tag from "./../../src/components/Tag";
import TagAvailable from "./../../src/components/TagAvailable";
import MediaCard from "./../../src/components/MediaCard";
import TagUtilities from "./../../src/components/TagUtilities";
import SpotifyMediaCard from "./../../src/components/SpotifyMediaCard";
import LetterboxdMediaCard from "./../../src/components/LetterboxdMediaCard";
import Link from "next/link";

export default function APropos() {
  return (
    <main className="bg-white">
      <div className="pt-24 pb-20">
        <div className="max-w-[1440px] mx-auto w-[90%]">
          {/* Conteneur principal - change l'ordre en responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:order-2 lg:grid-cols-[auto_1fr] gap-6 sm:gap-10">
            {/* Section "Qui suis-je?" - apparaît en premier sur mobile */}
            <div className="flex flex-col gap-4 bg-white rounded-lg order-1 lg:order-2 lg:col-start-2">
              <p className="text-blue-600 text-3xl font-extrabold font-rethink-sans">
                Qui suis-je ?
              </p>
              <p className="text-blue-900">
                Passionné par le multimédia et la création de contenu, j'explore
                sans cesse de nouvelles façons d'allier technologie et
                créativité. Mon parcours a commencé sur YouTube avec des vidéos
                sur l'espace, où j'ai découvert ma passion pour le montage
                vidéo.
                <br />
                <br />
                Aujourd'hui, je propose mes services en tant que{" "}
                <span className="text-blue-600">monteur vidéo freelance</span>,
                collaborant sur des projets variés à distance. Également{" "}
                <span className="text-blue-600">cadreur à La Rochelle</span>, je
                peux réaliser des prises de vue sur place avant d'assurer le
                montage pour offrir des vidéos complètes et de qualité.
                <br />
                <br />
                Curieux et polyvalent,{" "}
                <span className="text-blue-600">j'aime toucher à tout</span> :
                audiovisuel, graphisme, communication digitale… Toujours prêt à
                relever de nouveaux défis !
              </p>
            </div>

            {/* Colonne de gauche - carte d'identité - apparaît en deuxième sur mobile */}
            <div className="flex flex-col gap-4 mx-auto lg:mx-0 w-full lg:max-w-72 order-2 md:order-1 lg:order-1 lg:col-start-1 lg:row-span-3 lg:sticky lg:top-24 lg:self-start">
              <div className="flex flex-col rounded-lg">
                <div className="relative flex items-stretch h-[450px] md:h-[300px] lg:h-[350px] w-full">
                  <Image
                    src="/arnaud_graciet-apropos.webp"
                    alt="Arnaud Graciet l'air surpris qui tient sa caméra et son objectif"
                    fill
                    className="object-cover object-[50%_30%]  lg:object-[50%_15%] rounded-t-lg border-x border-t border-blue-300"
                    priority
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
                link="/journal-personnel"
                newTab={false}
                size="base"
                className="w-full xs:w-auto"
              >
                Journal personnel
              </ButtonMain>
            </div>

            {/* Section des cartes media - apparaît en troisième sur mobile */}
            <div className="order-3 lg:order-3 lg:col-start-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                {/* MAP */}
                <Link
                  href="https://maps.apple.com/place?z=15&auid=6034166720712255280&address=17000+La+Rochelle%2C+France&coordinate=46.1622489%2C-1.1550672&name=La+Rochelle&lsp=6489"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden w-full h-52 rounded-lg border border-blue-300 transition-shadow duration-300 ease-in-out hover:shadow-lg"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/-1.1519041,46.1568242,12/700x500?access_token=pk.eyJ1IjoibGFyZWZhc3RybyIsImEiOiJjbTlpejFibDcwNXpxMmtzYmZxdW1nODk0In0.AHV1GODjHroWMOUaWaIwmQ"
                      alt="Carte de La Rochelle"
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, 33vw"
                      className="object-cover object-center rounded-lg transition-transform duration-500 ease-in-out group-hover:scale-105"
                      priority
                    />
                  </div>
                  <div className="absolute bottom-2 left-4 flex flex-col items-start z-10">
                    <p className="text-sm text-blue-300 font-rethink-sans">
                      J'habite à
                    </p>
                    <p className="text-blue-50 font-bold text-lg font-rethink-sans">
                      La Rochelle
                    </p>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#4e4aec]/0 to-[#4e4aec] z-5"></div>
                </Link>
                {/* MediaCards */}
                <div className="flex flex-col gap-4">
                  <SpotifyMediaCard />
                  <LetterboxdMediaCard />
                </div>
              </div>
            </div>

            {/* Section "Avec quoi je travaille" - apparaît en quatrième sur mobile */}
            <div className="flex flex-col gap-6 border border-slate-300 rounded-lg p-6 bg-slate-50 order-4 lg:order-4 lg:col-start-2">
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
                  bgColor="bg-[#edf3ff] dark:bg-[#1e1b4b]"
                  borderColor="border-[#a2b5ff] dark:border-[#4338ca]"
                  textColor="text-[#4e4aec] dark:text-[#818cf8]"
                  rounded={false}
                  link="https://www.adobe.com/fr/products/premiere.html"
                  newTab={true}
                />

                <TagUtilities
                  logoSrc="/after_effects.webp"
                  logoAlt="Logo After Effects"
                  label="After Effects"
                  description="Création d'effets spéciaux et animation graphique."
                  bgColor="bg-[#edf3ff] dark:bg-[#1e1b4b]"
                  borderColor="border-[#a2b5ff] dark:border-[#4338ca]"
                  textColor="text-[#4e4aec] dark:text-[#818cf8]"
                  rounded={false}
                  link="https://www.adobe.com/fr/products/aftereffects.html"
                  newTab={true}
                />

                <TagUtilities
                  logoSrc="/artlist.webp"
                  logoAlt="Logo Artlist"
                  label="Artlist"
                  description="Musique libre de droits pour créateurs."
                  bgColor="bg-[#fffeed] dark:bg-[#422006]"
                  borderColor="border-[#ffe6a2] dark:border-[#d97706]"
                  textColor="text-[#ecae4a] dark:text-[#fbbf24]"
                  rounded={true}
                  link="https://artlist.io/"
                  newTab={true}
                />

                <TagUtilities
                  logoSrc="/figma.webp"
                  logoAlt="Logo de Figma"
                  label="Figma"
                  description="Design collaboratif et prototypage."
                  bgColor="bg-[#ffeeed] dark:bg-[#450a0a]"
                  borderColor="border-[#ffa5a2] dark:border-[#dc2626]"
                  textColor="text-[#ec4a4a] dark:text-[#f87171]"
                  rounded={false}
                  link="https://www.figma.com/"
                  newTab={true}
                />

                <TagUtilities
                  logoSrc="/eagle.webp"
                  logoAlt="Logo de Eagle"
                  label="Eagle"
                  description="Gestion de fichiers pour designers."
                  bgColor="bg-[#e8f3ff] dark:bg-[#0c4a6e]"
                  borderColor="border-[#66a9f9] dark:border-[#0284c7]"
                  textColor="text-[#3186ff] dark:text-[#38bdf8]"
                  rounded={true}
                  link="https://eagle.cool/"
                  newTab={true}
                />

                <TagUtilities
                  logoSrc="/notion.webp"
                  logoAlt="Logo de Notion"
                  label="Notion"
                  description="Prise de notes et gestion de projets."
                  bgColor="bg-[#F8FAFC] dark:bg-[#1e1e1e]"
                  borderColor="border-[#CBD5E1] dark:border-[#3f3f46]"
                  textColor="text-[#475569] dark:text-[#e1e1e1]"
                  rounded={false}
                  link="https://www.notion.so/"
                  newTab={true}
                />

                <TagUtilities
                  logoSrc="/toggl_track.webp"
                  logoAlt="Logo de Toggl Track"
                  label="Toggl Track"
                  description="Suivi du temps pour la productivité."
                  bgColor="bg-[#ffedff] dark:bg-[#4a044e]"
                  borderColor="border-[#ffa2d2] dark:border-[#c026d3]"
                  textColor="text-[#ec4abb] dark:text-[#e879f9]"
                  rounded={false}
                  link="https://toggl.com/track/"
                  newTab={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-t from-blue-100/0 to-blue-100/75 pointer-events-none"></div>
    </main>
  );
}
