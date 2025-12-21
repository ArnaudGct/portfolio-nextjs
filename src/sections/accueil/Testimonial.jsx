"use client";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  GripHorizontal,
  Loader2,
  Star,
} from "lucide-react";
import ButtonSecondary from "../../components/ButtonSecondary";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Navigation } from "swiper/modules";

export default function Testimonial() {
  const [temoignages, setTemoignages] = useState([]);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTemoignages = async () => {
      try {
        // Charger en parallèle les avis Trustpilot et de la BDD
        const [trustpilotRes, dbRes] = await Promise.all([
          fetch("/api/extern/trustpilot").catch(() => null),
          fetch("/api/accueil/temoignages").catch(() => null),
        ]);

        const trustpilotData = trustpilotRes?.ok
          ? await trustpilotRes.json()
          : [];
        const dbData = dbRes?.ok ? await dbRes.json() : [];

        if (isMounted) {
          // Marquer les avis de la BDD
          const dbReviews = dbData.map((t) => ({ ...t, source: "database" }));
          // Combiner: Trustpilot en premier, puis BDD
          const allReviews = [...trustpilotData, ...dbReviews];
          setTemoignages(allReviews);
          console.log("✅ Avis chargés:", allReviews.length, "total");
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des avis :", error);
        if (isMounted) {
          setTemoignages([]);
        }
      }
    };

    fetchTemoignages();

    return () => {
      isMounted = false;
    };
  }, []);

  // Connecter les boutons de navigation après l'initialisation de Swiper
  useEffect(() => {
    if (swiperInstance && prevButtonRef.current && nextButtonRef.current) {
      swiperInstance.navigation.init();
      swiperInstance.navigation.update();
    }
  }, [swiperInstance]);

  // Gérer le clic manuel sur les boutons de navigation
  const handlePrevClick = () => {
    if (swiperInstance) {
      swiperInstance.slidePrev();
    }
  };

  const handleNextClick = () => {
    if (swiperInstance) {
      swiperInstance.slideNext();
    }
  };

  // Composant étoiles pour Trustpilot
  const StarRating = ({ rating }) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "fill-[#00b67a] text-[#00b67a]" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  // Composant Témoignage
  const TestimonialCard = ({ temoignage }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-5 transition-all duration-500 ease-in-out">
        <div className="flex flex-col gap-5 select-none">
          <div className="flex gap-5 items-start">
            <Quote
              strokeWidth={1.75}
              className="w-12 h-12 text-blue-600 shrink-0"
            />
            <div className="text-blue-900 text-normal font-normal flex flex-col items-start flex-1 gap-2">
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded ? "max-h-none" : "max-h-24 line-clamp-4"
                }`}
              >
                <ReactMarkdown>{temoignage.contenu}</ReactMarkdown>
              </div>
              {temoignage.contenu.length > 200 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 text-sm font-semibold hover:underline cursor-pointer"
                >
                  {isExpanded ? "Voir moins" : "Voir plus"}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            {temoignage.source === "trustpilot" && (
              <div className="flex items-center gap-2">
                <StarRating rating={temoignage.rating} />
                <a
                  href="https://fr.trustpilot.com/review/arnaudgct.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00b67a] font-semibold hover:underline"
                >
                  Trustpilot
                </a>
              </div>
            )}
            <p
              className={`text-blue-600 font-rethink-sans text-lg font-extrabold ${temoignage.source !== "trustpilot" ? "text-right w-full" : "text-right"}`}
            >
              {temoignage.client}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="max-w-[1440px] mx-auto relative w-[90%]">
      <div className="flex gap-2 absolute bottom-0 right-0 z-10 transform translate-y-3/2">
        <ButtonSecondary
          ref={prevButtonRef}
          className="prev-button"
          icon={<ChevronLeft className="w-6 h-6" />}
          onClick={handlePrevClick}
        />
        <ButtonSecondary
          ref={nextButtonRef}
          className="next-button"
          icon={<ChevronRight className="w-6 h-6" />}
          onClick={handleNextClick}
        />
      </div>

      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        loop={true}
        grabCursor={true}
        loopAdditionalSlides={2}
        // autoplay={{
        //   delay: 6000,
        //   disableOnInteraction: false,
        // }}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }}
        navigation={{
          prevEl: prevButtonRef.current,
          nextEl: nextButtonRef.current,
        }}
        onSwiper={setSwiperInstance}
        modules={[Navigation, Autoplay]}
        className="mySwiper"
        allowTouchMove={true}
      >
        {temoignages.length > 0 ? (
          temoignages.map((temoignage) => (
            <SwiperSlide key={temoignage.id_tem}>
              <TestimonialCard temoignage={temoignage} />
            </SwiperSlide>
          ))
        ) : (
          <>
            {[1, 2, 3].map((index) => (
              <SwiperSlide key={`skeleton-${index}`}>
                <motion.div
                  className="bg-blue-50 border border-blue-300 rounded-lg p-5 h-48"
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <div className="flex flex-col gap-5 h-full">
                    <div className="flex gap-5 items-start">
                      <Quote
                        strokeWidth={1.75}
                        className="w-12 h-12 text-blue-300 shrink-0"
                      />
                      <div className="flex flex-col grow gap-2">
                        <div className="h-4 bg-blue-200 rounded w-full"></div>
                        <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                        <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="mt-auto self-end">
                      <div className="h-5 bg-blue-200 rounded w-32"></div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </>
        )}
      </Swiper>

      <style jsx global>{`
        .mySwiper {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .swiper-slide {
          width: 80%;
        }
      `}</style>
    </section>
  );
}
