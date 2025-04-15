import Hero from "./../src/sections/accueil/Hero";
import Presentation from "./../src/sections/accueil/Presentation";
import LastVideos from "../src/sections/accueil/LastVideos";
import FAQ from "./../src/sections/accueil/FAQ";

export default function Home() {
  return (
    <main className="h-[6000px]">
      <Hero />
      <Presentation />
      <LastVideos />
      <FAQ />
    </main>
  );
}
