"use client";
import { Rethink_Sans, Outfit, Covered_By_Your_Grace } from "next/font/google";
import "./globals.css";
import Header from "./../src/sections/Header";
import Footer from "./../src/sections/Footer";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { themeScript } from "./../lib/themeScript";

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
  const isVideoPage = pathname.match(/^\/creations\/video\/\d+/);
  const isAutrePage = pathname.match(/^\/creations\/autre\/\d+/);

  // Exclure la page dynamique de l'affichage du Header
  const noHeaderRoutes = ["/journal-personnel"];
  const showHeader =
    !noHeaderRoutes.includes(pathname) &&
    !isAlbumPage &&
    !isVideoPage &&
    !isAutrePage;

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-R6313JH5FT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R6313JH5FT');
          `}
        </Script>
        <title>Arnaud Graciet - Vidéaste freelance</title>
        <meta
          name="description"
          content="Explorez le portfolio de Arnaud Graciet, monteur vidéo en freelance."
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${rethinkSans.variable} ${outfit.variable} ${coveredByYourGrace.variable} antialiased flex flex-col min-h-screen bg-white`}
      >
        {showHeader && <Header />}
        <div className="flex-grow">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
