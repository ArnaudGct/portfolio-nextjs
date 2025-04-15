import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function TagSocialMedia({ name }) {
  const config = {
    mail: {
      label: "contact@arnaudgct.fr",
      icon: <Mail width={16} strokeWidth={1.75} />,
      href: "mailto:contact@arnaudgct.fr",
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-300",
    },
    instagram: {
      label: "Instagram",
      icon: (
        <Image src="/instagram.webp" alt="Instagram" width={16} height={16} />
      ),
      href: "https://www.instagram.com/arnaud_gct/",
      text: "text-[#e94aec]",
      bg: "bg-[#ffedfd]",
      border: "border-[#fdbef0]",
    },
    linkedin: {
      label: "LinkedIn",
      icon: (
        <Image src="/linkedin.webp" alt="LinkedIn" width={16} height={16} />
      ),
      href: "https://www.linkedin.com/in/arnaud-graciet/",
      text: "text-[#4a82ec]",
      bg: "bg-[#edf8ff]",
      border: "border-[#bddcff]",
    },
  };

  const social = config[name];

  if (!social) return null;

  return (
    <Link href={social.href} target="_blank" rel="noopener noreferrer">
      <button
        className={`flex items-center text-normal font-medium font-rethink-sans px-4 py-1 rounded-lg gap-2
        ${social.text} ${social.bg} ${social.border} border transition hover:opacity-80 cursor-pointer`}
      >
        <span>{social.icon}</span>
        <p>{social.label}</p>
      </button>
    </Link>
  );
}
