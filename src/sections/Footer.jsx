"use client"; // à ajouter si tu es dans un fichier de layout ou page
import Image from "next/image";
import Tag from "./../components/Tag";
import TagSocialMedia from "./../components/TagSocialMedia";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  return (
    <footer className="bg-blue-50 w-full mt-auto">
      <div className="flex flex-col justify-center items-start lg:flex-row lg:justify-between lg:items-center gap-12 py-16 w-[90%] max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-8 items-start justify-start">
          <div className="flex gap-4 items-center justify-start">
            <Image
              src="/arnaud_graciet_pp.webp"
              alt="Arnaud Graciet qui sourit"
              width={90}
              height={90}
              className="rounded-lg"
            />
            <div className="flex flex-col gap-2 items-start justify-start">
              <div>
                <p className="text-blue-600 text-3xl font-normal font-rethink-sans">
                  Arnaud <span className="font-extrabold">Graciet</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Tag name="monteur vidéo" background={false} />
                <Tag name="cadreur" background={false} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <TagSocialMedia name="mail" />
            <TagSocialMedia name="instagram" />
            <TagSocialMedia name="linkedin" />
          </div>
        </div>
        <div className="flex flex-col gap-8 items-start lg:items-end justify-start">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 items-start justify-start">
            <li
              className={`text-normal font-medium font-rethink-sans ${
                pathname === "/" ? "text-blue-700" : "text-blue-900"
              }`}
            >
              <Link href="/">Accueil</Link>
            </li>
            <li
              className={`text-normal font-medium font-rethink-sans ${
                pathname === "/apropos" ? "text-blue-700" : "text-blue-900"
              }`}
            >
              <Link href="/apropos">À propos</Link>
            </li>
            <li
              className={`text-normal font-medium font-rethink-sans ${
                pathname === "/creations" ? "text-blue-700" : "text-blue-900"
              }`}
            >
              <Link href="/creations">Mes créations</Link>
            </li>
            <li
              className={`text-normal font-medium font-rethink-sans ${
                pathname === "/mentions-legales"
                  ? "text-blue-700"
                  : "text-blue-900"
              }`}
            >
              <Link href="/mentions-legales">Mentions légales</Link>
            </li>
          </ul>
          <div className="flex flex-col items-start lg:items-end justify-start">
            <p className="text-blue-700 text-sm font-normal font-rethink-sans mt-4">
              Site web designé sur{" "}
              <Link
                href="https://www.figma.com/design/dOuGAgIR48yjWsPXHWQKEy/Portfolio---Version-public?node-id=0-1&t=wD0zYEQkVPHqQpbU-1"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold"
              >
                Figma
              </Link>{" "}
              et développé en{" "}
              <Link
                href="https://github.com/ArnaudGct/portfolio-next"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold"
              >
                Next.js
              </Link>{" "}
              par Arnaud Graciet.
            </p>
            <p className="text-blue-700 text-sm font-normal font-rethink-sans">
              © 2025 Arnaud Graciet. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
