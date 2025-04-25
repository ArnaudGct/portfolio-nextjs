"use client";
import { Rethink_Sans, Outfit, Covered_By_Your_Grace } from "next/font/google";
import "./globals.css";
import Header from "./../src/sections/Header";
import Footer from "./../src/sections/Footer";
import { usePathname } from "next/navigation";

const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  variable: "--font-rethink-sans",
  weight: ["400", "500", "600", "700", "800"], // choisis les poids que tu veux utiliser
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800", "900"], // choisis les poids que tu veux utiliser
});

const coveredByYourGrace = Covered_By_Your_Grace({
  subsets: ["latin"],
  variable: "--font-covered-by-your-grace",
  weight: ["400"], // choisis les poids que tu veux utiliser
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Vérifie si l'URL contient /creations/album/[id_alb]
  const isAlbumPage = pathname.match(/^\/creations\/album\/\d+/);

  // Exclure la page dynamique de l'affichage du Header
  const noHeaderRoutes = ["/journal-personnel"];
  const showHeader = !noHeaderRoutes.includes(pathname) && !isAlbumPage;

  return (
    <html lang="fr">
      <head>
        <title>Arnaud Graciet - Vidéaste freelance</title>
        <meta
          name="description"
          content="Explorez le portfolio de Arnaud Graciet, monteur vidéo en freelance."
        />
      </head>
      <body
        className={`${rethinkSans.variable} ${outfit.variable} ${coveredByYourGrace.variable} antialiased`}
      >
        {showHeader && <Header />}
        {children}
        <Footer />
      </body>
    </html>
  );
}
