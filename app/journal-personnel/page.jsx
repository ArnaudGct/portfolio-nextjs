"use client";
import React, { useState, useEffect, useRef } from "react";
import ButtonSecondary from "./../../src/components/ButtonSecondary";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FormattedDate from "./../../src/components/FormattedDate";
import Image from "next/image";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import Breadcrumb from "./../../src/components/Breadcrumb";
import ReactMarkdown from "react-markdown";

export default function JournalPersonnel() {
  const [experiences, setExperiences] = useState([]);
  const [videosInView, setVideosInView] = useState({});
  const [imagesInView, setImagesInView] = useState({});
  const videoRefs = useRef({});
  const imageRefs = useRef({});
  const [loadingVideos, setLoadingVideos] = useState({});

  // Récupération des expériences
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const res = await fetch("/api/journal-personnel");
        const data = await res.json();
        setExperiences(data);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des expériences :",
          error
        );
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

  const getYouTubeId = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.searchParams.get("v") || null;
    } catch (e) {
      return null;
    }
  };

  return (
    <main>
      <div className="flex flex-col w-[90%] mx-auto max-w-[1440px] gap-10 mt-20 mb-20">
        <Breadcrumb
          pages={[
            { name: "À propos", path: "/apropos" },
            { name: "Journal personnel", path: "/journal-personnel" },
          ]}
        />

        <div className="flex flex-col gap-8">
          <div>
            <p className="text-3xl font-extrabold font-rethink-sans text-blue-600">
              Mon journal personnel
            </p>
            <p className="text-lg text-blue-900">
              De YouTube au freelance, en passant par la création d’applications
              et des concours de court-métrage, je tente toujours à repousser
              mes limites.
            </p>
          </div>

          <div className="relative">
            <div className="border-l-1 border-blue-300 absolute left-2 top-0 bottom-0"></div>

            {experiences.map((experience) => {
              const youtubeId = getYouTubeId(experience.url_img);
              const isVideo = !!youtubeId;
              const id = experience.id_exp;

              return (
                <div key={id} className="relative flex items-center mb-8">
                  <div className="absolute left-0 top-6 w-4 h-4 bg-blue-600 rounded-full"></div>

                  <div className="ml-10 flex flex-col gap-4">
                    <div className="flex flex-col">
                      <p className="text-blue-600 font-rethink-sans font-extrabold text-xl">
                        <FormattedDate date={experience.date} />
                      </p>
                      <p className="text-blue-500 text-lg">
                        {experience.titre}
                      </p>
                    </div>

                    <div className="flex flex-col items-start justify-center lg:flex-row lg:justify-between gap-6">
                      <p className="text-blue-900 flex flex-col gap-4 w-full">
                        <ReactMarkdown>{experience.description}</ReactMarkdown>
                      </p>

                      {experience.url_img && (
                        <div className="w-full lg:w-[50%] lg:min-w-[400px]">
                          {isVideo ? (
                            videosInView[id] ? (
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
                                title="Amazon DynamoDB Deep Dive"
                                poster="hqdefault"
                                webp
                                onLoad={() => handleIframeLoad(id)}
                              />
                            ) : (
                              <div
                                data-id={id}
                                data-type="video"
                                ref={(el) => (videoRefs.current[id] = el)}
                                className="w-full h-[300px] bg-blue-100 rounded-lg animate-pulse"
                              />
                            )
                          ) : (
                            <div
                              data-id={id}
                              data-type="image"
                              ref={(el) => (imageRefs.current[id] = el)}
                              className="w-full h-auto"
                            >
                              {imagesInView[id] ? (
                                <Image
                                  src={experience.url_img}
                                  alt="Image de l'expérience"
                                  width={1280}
                                  height={720}
                                  className="w-full object-cover rounded-lg aspect-video transition-opacity duration-500 opacity-100"
                                />
                              ) : (
                                <div className="w-full h-[300px] bg-blue-100 rounded-lg animate-pulse" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-t from-[#dfe7ff]/0 to-[#dfe7ff]/75 pointer-events-none"></div>
    </main>
  );
}
