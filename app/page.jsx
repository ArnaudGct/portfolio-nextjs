import Hero from "./../src/sections/accueil/Hero";
import Presentation from "./../src/sections/accueil/Presentation";
import LastVideos from "../src/sections/accueil/LastVideos";
import FAQ from "./../src/sections/accueil/FAQ";
import Testimonial from "../src/sections/accueil/Testimonial";
import Contact from "./../src/sections/accueil/Contact";

export default function Home() {
  return (
    <main className="bg-white flex flex-col w-full gap-16 md:gap-18 lg:gap-24">
      <Hero />
      <div className="flex flex-col w-full gap-18 md:gap-20 lg:gap-28 mb-28">
        <Presentation />
        <LastVideos />
        <div className="flex flex-col gap-14 md:gap-16">
          <FAQ />
          <Testimonial />
        </div>
        <div className="w-full mt-16">
          <Contact />
        </div>
      </div>
    </main>
  );
}
