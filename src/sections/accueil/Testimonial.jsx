"use client";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight, Quote, GripHorizontal } from "lucide-react";
import ButtonSecondary from "../../components/ButtonSecondary";
import ReactMarkdown from "react-markdown";

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
    const fetchTemoignages = async () => {
      try {
        const res = await fetch("/api/accueil/temoignages");
        const data = await res.json();
        console.log("✅ Avis reçus :", data);
        setTemoignages(data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des avis :", error);
      }
    };

    fetchTemoignages();
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

  // Composant Témoignage
  const TestimonialCard = ({ temoignage }) => (
    <div className="bg-blue-50 border border-blue-300 rounded-lg p-5 transition-all duration-500 ease-in-out">
      <div className="flex flex-col gap-5 select-none">
        <div className="flex gap-5 items-start">
          <Quote
            strokeWidth={1.75}
            className="w-12 h-12 text-blue-600 shrink-0"
          />
          <div className="text-blue-900 text-normal font-normal">
            <ReactMarkdown>{temoignage.contenu}</ReactMarkdown>
          </div>
        </div>
        <p className="text-blue-600 font-rethink-sans text-lg font-extrabold text-right">
          {temoignage.client}
        </p>
      </div>
    </div>
  );

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
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
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
          <SwiperSlide>
            <div className="h-32 flex items-center justify-center">
              <p>Chargement des témoignages...</p>
            </div>
          </SwiperSlide>
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
