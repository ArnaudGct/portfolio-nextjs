import { Rethink_Sans, Outfit, Covered_By_Your_Grace } from "next/font/google";
import "./globals.css";
import Header from "./../src/sections/Header";
import Footer from "./../src/sections/Footer";

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

export const metadata = {
  title: "Arnaud Graciet - Vidéaste freelance",
  description:
    "Explorez le portfolio de Arnaud Graciet, monteur vidéo en freelance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${rethinkSans.variable} ${outfit.variable} ${coveredByYourGrace.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
