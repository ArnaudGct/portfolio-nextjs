import Hero from "./../src/sections/accueil/Hero";
import Presentation from "./../src/sections/accueil/Presentation";
import Videos from "./../src/sections/accueil/Videos";

export default function Home() {
  return (
    <main className="h-[4000px]">
      <Hero />
      <Presentation />
      <Videos />
    </main>
  );
}
