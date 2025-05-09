import Hero from "./../src/sections/accueil/Hero";
import Presentation from "./../src/sections/accueil/Presentation";
import LastVideos from "../src/sections/accueil/LastVideos";
import FAQ from "./../src/sections/accueil/FAQ";
import Testimonial from "../src/sections/accueil/Testimonial/Testimonial";
import Contact from "./../src/sections/accueil/Contact";

export default function Home() {
  return (
    <main className="bg-white">
      <Hero />
      <Presentation />
      <LastVideos />
      <FAQ />
      <Testimonial />
      <Contact />
    </main>
  );
}
