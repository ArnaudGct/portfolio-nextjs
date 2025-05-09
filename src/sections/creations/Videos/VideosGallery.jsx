"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"; // Corrige aussi `motion/react` en `framer-motion`
import ButtonSecondary from "./../../../components/ButtonSecondary"; // ou adapte le chemin
import ButtonMain from "../../../components/ButtonMain"; // idem
import Tag from "../../../components/Tag"; // idem
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { ArrowUpRight } from "lucide-react"; // Assurez-vous que ce chemin est correct
import ReactMarkdown from "react-markdown";

export default function VideosGallery({ video }) {
  console.log("Video:", video);

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const formattedDate = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  let youtubeId = "";
  try {
    const parsedUrl = new URL(video.lien);
    youtubeId = parsedUrl.searchParams.get("v");
  } catch (error) {
    console.error(`❌ URL YouTube invalide (${video.lien}) :`, error);
  }

  return (
    <section>
      <div className="flex flex-col gap-8">
        {youtubeId ? (
          <LiteYouTubeEmbed
            id={youtubeId}
            title={video.titre}
            poster="hqdefault"
            webp
          />
        ) : null}
        {!youtubeId && <p className="text-red-500">Lien invalide</p>}
        <div className="flex flex-col gap-8 w-full">
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-start sm:gap-4 w-full">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-3xl font-extrabold font-rethink-sans text-blue-600">
                  {video.titre}
                </p>
                <p className="text-normal text-blue-900">
                  {formatDate(video.derniere_modification)}
                </p>
              </div>
              {video.videos_tags_link.length > 0 && (
                <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                  {video.videos_tags_link.map((tag, index) => (
                    <Tag key={index} name={tag.videos_tags.titre} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-shrink-0 min-w-fit">
              <ButtonSecondary
                icon={<ArrowUpRight size={16} />}
                link={video.lien}
                newTab={true}
                size="base"
              >
                Voir sur YouTube
              </ButtonSecondary>
            </div>
          </div>
          <div className="text-lg text-blue-900">
            {video.description && (
              <ReactMarkdown>{video.description}</ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
