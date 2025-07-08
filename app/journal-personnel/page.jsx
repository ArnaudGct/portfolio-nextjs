"use client";
import React, { useState, useEffect, useRef } from "react";
import ButtonSecondary from "./../../src/components/ButtonSecondary";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import FormattedDate from "./../../src/components/FormattedDate";
import Image from "next/image";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import Breadcrumb from "./../../src/components/Breadcrumb";
import ReactMarkdown from "react-markdown";

// Composant de ligne de skeleton
const SkeletonLine = ({ width = "w-full", height = "h-4" }) => (
  <div
    className={`${width} ${height} bg-blue-100 dark:bg-blue-900/30 animate-pulse rounded`}
  ></div>
);

// Composant de skeleton complet pour une expérience
const SkeletonExperience = () => (
  <div className="relative flex items-center mb-8">
    <div className="absolute left-0 top-6 w-4 h-4 bg-blue-300 dark:bg-blue-700 rounded-full"></div>
    <div className="ml-10 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <SkeletonLine width="w-32" />
        <SkeletonLine width="w-64" />
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
        <div className="w-full flex flex-col gap-3">
          <SkeletonLine />
          <SkeletonLine width="w-4/5" />
          <SkeletonLine width="w-5/6" />
          <SkeletonLine width="w-3/4" />
        </div>

        <div className="w-full lg:w-[50%] lg:min-w-[400px] aspect-video bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default function JournalPersonnel() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videosInView, setVideosInView] = useState({});
  const [imagesInView, setImagesInView] = useState({});
  const videoRefs = useRef({});
  const imageRefs = useRef({});
  const [loadingVideos, setLoadingVideos] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

  // Récupération des expériences
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/journal-personnel");
        const data = await res.json();
        setExperiences(data);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des expériences :",
          error
        );
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  // Observer les vidéos et images
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-id");

          if (entry.isIntersecting) {
            if (entry.target.dataset.type === "video") {
              setVideosInView((prev) => ({ ...prev, [id]: true }));
            } else if (entry.target.dataset.type === "image") {
              setImagesInView((prev) => ({ ...prev, [id]: true }));
            }
            observer.unobserve(entry.target); // Stop observer une fois visible
          }
        });
      },
      { threshold: 0.5 }
    );

    // Appliquer observer après que les refs soient en place
    Object.entries(videoRefs.current).forEach(([id, el]) => {
      if (el) observer.observe(el);
    });
    Object.entries(imageRefs.current).forEach(([id, el]) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [experiences]);

  const handleIframeLoad = (id) => {
    setLoadingVideos((prev) => ({ ...prev, [id]: false }));
  };

  const handleImageLoad = (id) => {
    setLoadingImages((prev) => ({ ...prev, [id]: false }));
  };

  const getYouTubeId = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.searchParams.get("v") || null;
    } catch (e) {
      return null;
    }
  };

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
    <main className="bg-white">
      <div className="flex flex-col w-[90%] mx-auto max-w-[1440px] gap-10 pt-10 pb-20">
        <Breadcrumb
          pages={[
            { name: "À propos", path: "/apropos" },
            { name: "Journal personnel", path: "/journal-personnel" },
          ]}
        />

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-3xl font-extrabold font-rethink-sans text-blue-600">
              Mon journal personnel
            </p>
            <p className="text-lg/8 text-blue-900">
              De YouTube au freelance, en passant par la création d'applications
              et des concours de court-métrage, je tente d'être curieux en
              testant de nouvelles choses.
            </p>
          </div>

          <div className="relative">
            <div className="border-l-1 border-blue-300 absolute left-2 top-0 bottom-0"></div>
            <div className="flex flex-col gap-20">
              {loading ? (
                // Afficher 3 skeletons pendant le chargement
                <>
                  <SkeletonExperience />
                  <SkeletonExperience />
                  <SkeletonExperience />
                </>
              ) : experiences.length === 0 ? (
                <p className="ml-10 text-blue-900">
                  Aucune expérience à afficher pour le moment.
                </p>
              ) : (
                experiences.map((experience) => {
                  const youtubeId = getYouTubeId(experience.url_img);
                  const isVideo = !!youtubeId;
                  const id = experience.id_exp;

                  return (
                    <div key={id} className="relative flex items-center">
                      <div className="absolute left-0 top-6 w-4 h-4 bg-blue-600 rounded-full"></div>

                      <div className="ml-10 flex flex-col gap-4">
                        <div className="flex flex-col items-center justify-center lg:flex-row lg:justify-between gap-6">
                          <div className="w-full flex flex-col gap-3">
                            <div className="flex flex-col">
                              <p className="text-blue-600 font-rethink-sans font-extrabold text-xl">
                                <FormattedDate date={experience.date} />
                              </p>
                              <p className="text-blue-500 text-lg">
                                {experience.titre}
                              </p>
                            </div>
                            <div className="text-blue-900 flex flex-col gap-4 w-full">
                              <ReactMarkdown
                                components={{
                                  a: CustomLink,
                                }}
                              >
                                {experience.description}
                              </ReactMarkdown>
                            </div>
                          </div>

                          {experience.url_img && (
                            <div className="w-full lg:w-[50%] lg:min-w-[400px]">
                              {isVideo ? (
                                videosInView[id] ? (
                                  <div className="relative w-full h-full">
                                    <LiteYouTubeEmbed
                                      id={youtubeId}
                                      data-id={id}
                                      data-type="video"
                                      ref={(el) => (videoRefs.current[id] = el)}
                                      className={`w-full h-full rounded-lg aspect-video transition-opacity duration-500 ${
                                        loadingVideos[id] === false
                                          ? "opacity-100"
                                          : "opacity-50"
                                      }`}
                                      title={experience.titre}
                                      poster="hqdefault"
                                      webp
                                      onLoad={() => handleIframeLoad(id)}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    data-id={id}
                                    data-type="video"
                                    ref={(el) => (videoRefs.current[id] = el)}
                                    className="w-full h-[300px] bg-blue-100 rounded-lg animate-pulse flex items-center justify-center"
                                  >
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                  </div>
                                )
                              ) : (
                                <div
                                  data-id={id}
                                  data-type="image"
                                  ref={(el) => (imageRefs.current[id] = el)}
                                  className="w-full h-auto"
                                >
                                  {imagesInView[id] ? (
                                    <div className="relative w-full h-full">
                                      <Image
                                        src={experience.url_img}
                                        alt={`Image: ${experience.titre}`}
                                        width={640}
                                        height={360}
                                        placeholder="blur"
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                                        priority={false}
                                        className={`w-full object-cover rounded-lg aspect-video transition-opacity duration-500 ${
                                          loadingImages[id] === false
                                            ? "opacity-100"
                                            : "opacity-50"
                                        }`}
                                        onLoad={() => handleImageLoad(id)}
                                      />

                                      {experience.credit_url &&
                                        experience.credit_nom && (
                                          <Link
                                            href={experience.credit_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <div className="absolute bottom-2 left-2 bg-blue-900/50 px-2 py-1 rounded text-xs text-white backdrop-blur-xs">
                                              <p>📸 {experience.credit_nom}</p>
                                            </div>
                                          </Link>
                                        )}

                                      {loadingImages[id] !== false && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="w-full h-[300px] bg-blue-100 rounded-lg animate-pulse flex items-center justify-center">
                                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-t from-blue-100/0 to-blue-100/75 pointer-events-none"></div>
    </main>
  );
}
