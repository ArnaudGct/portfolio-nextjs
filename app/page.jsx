import Hero from "./../src/sections/accueil/Hero";
import Presentation from "./../src/sections/accueil/Presentation";
import LastVideos from "../src/sections/accueil/LastVideos";
import FAQ from "./../src/sections/accueil/FAQ";
import Testimonial from "./../src/sections/accueil/Testimonial";

export default function Home() {
  return (
    <main className="h-[6000px]">
      <Hero />
      <Presentation />
      <LastVideos />
      <FAQ />
      <Testimonial />
    </main>
  );
}
