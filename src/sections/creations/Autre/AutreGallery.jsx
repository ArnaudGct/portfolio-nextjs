"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; // Corrige aussi `motion/react` en `framer-motion`
import ButtonSecondary from "../../../components/ButtonSecondary"; // ou adapte le chemin
import ButtonMain from "../../../components/ButtonMain"; // idem
import Tag from "../../../components/Tag"; // idem
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { ArrowUpRight } from "lucide-react"; // Assurez-vous que ce chemin est correct
import { SiFigma, SiGithub } from "@icons-pack/react-simple-icons";
import ReactMarkdown from "react-markdown";

export default function VideosGallery({ autre }) {
  console.log("Autre:", autre);

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const formattedDate = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  return (
    <section>
      <div className="flex flex-col gap-8">
        <Image
          src={autre.miniature}
          alt={autre.titre}
          width={1920}
          height={1080}
          className="w-full h-auto rounded-lg object-cover"
          priority
        />
        {/* {youtubeId ? (
          <LiteYouTubeEmbed
            id={youtubeId}
            title={video.titre}
            poster="hqdefault"
            webp
          />
        ) : null}
        {!youtubeId && <p className="text-red-500">Lien invalide</p>} */}
        <div className="flex flex-col gap-8 w-full">
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-start sm:gap-4 w-full">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-3xl font-extrabold font-rethink-sans text-blue-600">
                  {autre.titre}
                </p>
                <p className="text-normal text-blue-900">
                  {formatDate(autre.date)}
                </p>
              </div>
              {/* <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                {autre.autre_tags_link.map((tag, index) => (
                    <Tag key={index} name={tag.autre_tags.titre} />
                  ))}
              </div> */}
              {autre.autre_tags_link.length > 0 && (
                <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                  {autre.autre_tags_link
                    .sort(
                      (a, b) =>
                        (b.autre_tags.important || 0) -
                        (a.autre_tags.important || 0)
                    )
                    .map((tag, index) => (
                      <Tag
                        key={`tag-${tag.autre_tags.titre}-${index}`}
                        name={tag.autre_tags.titre}
                        background={tag.autre_tags.important ? "blue" : false}
                      />
                    ))}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 min-w-fit flex gap-2">
              <ButtonSecondary
                icon={<SiGithub size={16} />}
                link={autre.lien_github}
                newTab={true}
                size="base"
              />
              <ButtonSecondary
                icon={<SiFigma size={16} />}
                link={autre.lien_figma}
                newTab={true}
                size="base"
              />
              <ButtonSecondary
                icon={<ArrowUpRight size={16} />}
                link={autre.lien_site}
                newTab={true}
                size="base"
              >
                Voir le site
              </ButtonSecondary>
            </div>
          </div>
          <div className="text-lg text-blue-900">
            {autre.description && (
              <ReactMarkdown>{autre.description}</ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
