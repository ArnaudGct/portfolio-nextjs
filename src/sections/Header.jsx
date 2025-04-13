"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Linkedin, Instagram, Phone, Mail } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "motion/react";
import ButtonMain from "./../components/ButtonMain";
import ButtonSecondary from "./../components/ButtonSecondary";
import ThemeToggle from "./../components/ThemeToggl";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldShowIcons, setShouldShowIcons] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollDebounceRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const { scrollY } = useScroll();

  // const headerScale = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerWidth = useTransform(scrollY, [0, 100], ["100%", "60%"]);
  const headerPadding = useTransform(scrollY, [0, 100], ["0 2rem", "0 1.5rem"]);
  const headerRadius = useTransform(scrollY, [0, 100], ["0px", "8px"]);
  const headerPositionY = useTransform(scrollY, [0, 100], ["0px", "10px"]);

  const springConfig = {
    stiffness: 100,
    damping: 15,
    bounce: 0.25,
  };

  // const smoothScale = useSpring(headerScale, springConfig);
  const smoothWidth = useSpring(headerWidth, springConfig);
  const smoothPadding = useSpring(headerPadding, springConfig);
  const smoothRadius = useSpring(headerRadius, springConfig);
  const smoothPositionY = useSpring(headerPositionY, springConfig);

  const pathname = usePathname();
  const linkClass = (href) =>
    pathname === href ? "text-blue-700" : "text-blue-900";

  // 🔧 Mesure de la largeur réelle des icônes
  const iconsRef = useRef(null);
  const [iconsWidth, setIconsWidth] = useState(0);

  useEffect(() => {
    if (iconsRef.current) {
      const observer = new ResizeObserver(() => {
        const width = iconsRef.current?.getBoundingClientRect().width || 0;
        setIconsWidth(width);
      });

      observer.observe(iconsRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setShouldShowIcons(true);
      } else if (currentScrollY >= 10) {
        setShouldShowIcons(false);
      }

      setIsScrolled(currentScrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, []);

  return (
    <header className="flex justify-center w-full fixed top-0 left-0 z-30">
      <motion.div
        className="hidden lg:flex justify-between items-center mx-auto transition-colors duration-300"
        style={{
          // scale: smoothScale,
          width: smoothWidth,
          padding: smoothPadding,
          borderRadius: smoothRadius,
          position: "relative",
          top: smoothPositionY,
        }}
        animate={{
          backgroundColor: isScrolled
            ? "rgba(255, 255, 255, 1)"
            : "rgba(255, 255, 255, 0)",
          boxShadow: isScrolled
            ? "0px 4px 8px rgba(0, 0, 0, 0.1)"
            : "0px 0px 0px rgba(0, 0, 0, 0)",
        }}
        transition={{
          backgroundColor: { duration: 0.3 },
          boxShadow: { duration: 0.3 },
        }}
      >
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-[9px]">
            <Image src="/logo.webp" alt="Logo" width={32} height={32} />
          </Link>
          <nav className="flex justify-between items-center">
            <ul className="flex gap-8">
              <Link
                href="/"
                className={`${linkClass("/")} relative font-normal`}
              >
                <li className="py-5">Accueil</li>
              </Link>
              <Link
                href="/apropos"
                className={`${linkClass("/apropos")} relative font-normal`}
              >
                <li className="py-5">À propos</li>
              </Link>
              <Link
                href="/creations"
                className={`${linkClass("/creations")} relative font-normal`}
              >
                <li className="py-5">Mes créations</li>
              </Link>
            </ul>
          </nav>
        </div>

        <div className="flex items-center justify-end gap-2">
          {/* Bouton principal : toujours visible */}
          <motion.div
            layout
            transition={{
              layout: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 1,
              },
            }}
          >
            <ButtonMain
              icon={<Phone size={16} strokeWidth={1.75} />}
              size="sm"
              link="https://cal.com/arnaudgct/prise-de-contact"
              newTab={true}
              className="mr-5"
            >
              Réserver un appel
            </ButtonMain>
          </motion.div>

          {/* Conteneur des icônes sociales : largeur animée */}
          <motion.div
            className="flex items-center"
            animate={{ width: shouldShowIcons ? iconsWidth : 0 }}
            transition={{
              width: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 1,
              },
            }}
            style={{ overflow: "hidden" }}
          >
            {/* Contenu réel mesuré, mais hors animation de width */}
            <div
              ref={iconsRef}
              className="flex items-stretch gap-2"
              style={{
                opacity: shouldShowIcons ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            >
              <ButtonSecondary
                icon={<Mail size={16} strokeWidth={1.75} />}
                size="sm"
                link="mailto:contact@arnaudgct.fr"
                newTab={true}
              />

              <ButtonSecondary
                icon={<Instagram size={16} strokeWidth={1.75} />}
                size="sm"
                link="https://www.instagram.com/arnaud_gct/"
                newTab={true}
              />

              <ButtonSecondary
                icon={<Linkedin size={16} strokeWidth={1.75} />}
                size="sm"
                link="https://www.linkedin.com/in/arnaud-graciet/"
                newTab={true}
              />

              <motion.span
                className="h-5 bg-blue-900 self-center rounded mx-2.5"
                style={{ width: "1px" }}
              />

              <motion.div className="flex items-stretch">
                <ThemeToggle />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Version mobile */}
      <div className="lg:hidden relative w-full">
        <div className="flex justify-between items-center px-8 py-4 z-50">
          <Link href="/">
            <div className="flex items-center gap-4 z-50">
              <Image src="/logo.webp" alt="Logo" width={32} height={32} />
              <ButtonMain
                icon={<Phone size={16} strokeWidth={1.75} />}
                children="Réserver un appel"
                size="sm"
                link="https://cal.com/arnaudgct/prise-de-contact"
                newTab={true}
              />
            </div>
          </Link>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={toggleMenu}
            className="z-50"
          >
            {isMenuOpen ? (
              <X className="text-blue-700" width={26} height={26} />
            ) : (
              <Menu className="text-blue-700" width={26} height={26} />
            )}
          </motion.button>
        </div>

        {/* Menu mobile (overlay) */}
        <AnimatePresence>
          {isMenuOpen ? (
            <div className="fixed flex items-end justify-between z-50 w-full px-8 py-1">
              <motion.nav
                className="flex flex-col items-start justify-center gap-4"
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ease: "easeOut", duration: 0.2, delay: 0.1 }}
              >
                <Link
                  href="/"
                  className={`${linkClass("/")} font-normal`}
                  onClick={toggleMenu}
                >
                  Accueil
                </Link>
                <Link
                  href="/apropos"
                  className={`${linkClass("/apropos")} font-normal`}
                  onClick={toggleMenu}
                >
                  À propos
                </Link>
                <Link
                  href="/creations"
                  className={`${linkClass("/creations")} font-normal`}
                  onClick={toggleMenu}
                >
                  Mes créations
                </Link>
              </motion.nav>
              <div className="flex gap-4">
                <motion.div
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ease: "easeOut", duration: 0.3 }}
                >
                  <Link
                    href="https://www.instagram.com/libellule/"
                    onClick={toggleMenu}
                  >
                    <Instagram className="text-blue-700" />
                  </Link>
                </motion.div>
                <motion.div
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ease: "easeOut", duration: 0.3 }}
                >
                  <Link
                    href="https://www.linkedin.com/company/libelluleapp/"
                    onClick={toggleMenu}
                  >
                    <Linkedin className="text-blue-700" />
                  </Link>
                </motion.div>
              </div>
            </div>
          ) : null}
        </AnimatePresence>

        <motion.div
          initial={{ height: "65px" }}
          animate={{ height: isMenuOpen ? "205px" : "65px" }}
          transition={{ type: "spring", bounce: 0.35 }}
          className="absolute top-0 right-0 bg-white shadow w-full z-40"
        ></motion.div>
      </div>
    </header>
  );
}
