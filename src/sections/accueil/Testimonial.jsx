"use client";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import ButtonSecondary from "./../../components/ButtonSecondary";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./styles.css";

// import required modules
import { Navigation } from "swiper/modules";

export default function Testimonial() {
  const [aviss, setAvis] = useState([]);

  useEffect(() => {
    const fetchAvis = async () => {
      try {
        const res = await fetch("/api/accueil/avis");
        const data = await res.json();
        console.log("✅ Avis reçus :", data);
        setAvis(data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des avis :", error);
      }
    };

    fetchAvis();
  }, []);

  // Composant Témoignage
  const TestimonialCard = ({ avis }) => (
    <div className="bg-blue-50 border border-blue-300 rounded-lg p-5 transition-all duration-500 ease-in-out">
      <div className="flex flex-col gap-5">
        <div className="flex gap-5 items-start">
          <Quote
            strokeWidth={1.75}
            className="w-12 h-12 text-blue-600 shrink-0"
          />
          <p
            className="text-blue-900 text-normal font-normal"
            dangerouslySetInnerHTML={{ __html: avis.commentaire }}
          ></p>
        </div>
        <p className="text-blue-600 font-rethink-sans text-lg font-extrabold text-right">
          {avis.client}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto relative w-[90%] mt-14">
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
        modules={[Navigation]}
        className="mySwiper"
      >
        {aviss.map((avis) => (
          <SwiperSlide key={avis.id}>
            <TestimonialCard avis={avis} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
