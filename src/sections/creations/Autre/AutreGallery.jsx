"use client";
import Image from "next/image";
import { useState } from "react";
import ButtonSecondary from "../../../components/ButtonSecondary";
import Tag from "../../../components/Tag";
import { ArrowUpRight, Loader2 } from "lucide-react";
import FigmaIcon from "../../../icons/FigmaIcon";
import GitHubIcon from "../../../icons/GitHubIcon";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export default function VideosGallery({ autre }) {
  console.log("Autre:", autre);
  const [imageLoading, setImageLoading] = useState(true);

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const formattedDate = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

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
    <section>
      <div className="flex flex-col gap-8">
        <div className="relative w-full">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50 rounded-lg">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          )}

          <Image
            src={autre.miniature}
            alt={autre.titre}
            width={1280}
            height={720}
            className={`w-full h-auto rounded-lg object-cover ${imageLoading ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`}
            priority
            onLoad={() => setImageLoading(false)}
          />
        </div>

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
                icon={<GitHubIcon className="text-current" size={16} />}
                link={autre.lien_github}
                newTab={true}
                size="base"
              />
              <ButtonSecondary
                icon={<FigmaIcon className="text-current" size={16} />}
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
          <div className="text-normal/8 md:text-lg/8 text-blue-900">
            {autre.description && (
              <ReactMarkdown
                components={{
                  a: CustomLink,
                  p: ({ children }) => (
                    <p className="leading-8 mb-4">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="leading-8 mb-4 list-disc list-inside">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="leading-8 mb-4 list-decimal list-inside">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-8">{children}</li>
                  ),
                  h1: ({ children }) => (
                    <h1 className="leading-8 text-2xl font-bold mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="leading-8 text-xl font-bold mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="leading-8 text-lg font-bold mb-2">
                      {children}
                    </h3>
                  ),
                }}
              >
                {autre.description}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
