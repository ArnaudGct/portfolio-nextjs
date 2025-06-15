import Image from "next/image";
import Tag from "./../../components/Tag";
import TagAvailable from "./../../components/TagAvailable";
import { Cake, MapPin } from "lucide-react";
import ButtonMain from "./../../components/ButtonMain";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function Presentation() {
  const presentationText = `Après trois ans d'études en multimédia et plusieurs années à créer du contenu sur YouTube, je travaille aujourd'hui en freelance comme **monteur vidéo** et **cadreur**.

Mon parcours m'a permis de toucher à **différents domaines** (vidéo, photo, web design) mais c'est dans le **montage**, surtout pour YouTube et les réseaux sociaux, que je suis le plus à l'aise. En proposant mes services à distance ou sur place à La Rochelle, j'apporte une approche **polyvalente** et **adaptée à chaque projet**.`;

  // Composant personnalisé pour les liens
  const CustomLink = ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 underline hover:text-blue-600 transition-colors"
      {...props}
    >
      {children}
    </a>
  );

  return (
    <section className="relative w-[90%] max-w-[1440px] mx-auto flex flex-col sm:flex-row gap-5 md:gap-8 items-start sm:items-center justify-center sm:justify-start">
      <div className="relative flex items-stretch h-[500px] lg:h-[400px] w-full sm:w-[70%] lg:w-[50%] lg:max-w-[350px]">
        <Image
          src="/arnaud_graciet-accueil.webp"
          alt="Arnaud Graciet l'air surpris qui tient sa caméra et son objectif"
          fill
          className="object-cover object-[50%_15%] rounded-lg"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 350px"
          priority
        />

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
            <TagAvailable href="https://cal.com/arnaudgct/prise-de-contact" />
            <Tag
              name="21 ans"
              background={true}
              icon={<Cake size={14} strokeWidth={1.75} />}
            />
            <Tag
              name="La Rochelle"
              background={true}
              href="https://maps.apple.com/place?z=15&auid=6034166720712255280&address=17000+La+Rochelle%2C+France&coordinate=46.1622489%2C-1.1550672&name=La+Rochelle&lsp=6489"
              icon={<MapPin size={14} strokeWidth={1.75} />}
            />
            <Tag name="monteur vidéo" background={false} />
            <Tag name="cadreur" background={false} />
          </div>
        </div>
        <div className="text-blue-900 text-base/8 font-normal font-outfit">
          <ReactMarkdown
            components={{
              a: CustomLink,
              p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
              strong: ({ children }) => (
                <strong className="text-blue-600 font-normal">
                  {children}
                </strong>
              ),
            }}
          >
            {presentationText}
          </ReactMarkdown>
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
