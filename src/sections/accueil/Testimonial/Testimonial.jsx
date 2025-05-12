"use client";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import ButtonSecondary from "../../../components/ButtonSecondary";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./styles.css";

// import required modules
import { Autoplay, Navigation } from "swiper/modules";

export default function Testimonial() {
  const [temoignages, setTemoignages] = useState([]);

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

  // Composant Témoignage
  const TestimonialCard = ({ temoignage }) => (
    <div className="bg-blue-50 border border-blue-300 rounded-lg p-5 transition-all duration-500 ease-in-out">
      <div className="flex flex-col gap-5">
        <div className="flex gap-5 items-start">
          <Quote
            strokeWidth={1.75}
            className="w-12 h-12 text-blue-600 shrink-0"
          />
          <p
            className="text-blue-900 text-normal font-normal"
            dangerouslySetInnerHTML={{ __html: temoignage.contenu }}
          ></p>
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
          className="prev-button"
          icon={<ChevronLeft className="w-6 h-6" />}
        />
        <ButtonSecondary
          className="next-button"
          icon={<ChevronRight className="w-6 h-6" />}
        />
      </div>

      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        loop={true}
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
          nextEl: ".next-button",
          prevEl: ".prev-button",
        }}
        modules={[Navigation, Autoplay]}
        className="mySwiper"
      >
        {temoignages.map((temoignage) => (
          <SwiperSlide key={temoignage.id_tem}>
            <TestimonialCard temoignage={temoignage} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
