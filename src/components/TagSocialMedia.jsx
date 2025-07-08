import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function TagSocialMedia({ name }) {
  const config = {
    mail: {
      label: "arnaud@arnaudgct.fr",
      icon: <Mail width={16} strokeWidth={1.75} />,
      href: "mailto:arnaud@arnaudgct.fr",
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
      text: "text-[#e94aec] dark:text-[#f87df0]",
      bg: "bg-[#ffedfd] dark:bg-[#4d0055]/30",
      border: "border-[#fdbef0] dark:border-[#9b3d8c]",
    },
    linkedin: {
      label: "LinkedIn",
      icon: (
        <Image src="/linkedin.webp" alt="LinkedIn" width={16} height={16} />
      ),
      href: "https://www.linkedin.com/in/arnaud-graciet/",
      text: "text-[#4a82ec] dark:text-[#6a9aff]",
      bg: "bg-[#edf8ff] dark:bg-[#0a275a]/30",
      border: "border-[#bddcff] dark:border-[#2a5db3]",
    },
    x: {
      label: "X",
      icon: <Image src="/x.webp" alt="X" width={16} height={16} />,
      href: "https://x.com/ArnaudGct",
      text: "text-[#0F172A] dark:text-[#94A3B8]",
      bg: "bg-[#F8FAFC] dark:bg-gray-800/30",
      border: "border-[#CBD5E1] dark:border-gray-600",
    },
  };

  const social = config[name];

  if (!social) return null;

  // Animation pour l'icône
  const animatedIcon = (
    <div className="relative flex items-center justify-center h-5 w-5 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-400 group-hover:-translate-y-full">
        {social.icon}
      </div>
      <div className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-400 group-hover:translate-y-0">
        {social.icon}
      </div>
    </div>
  );

  return (
    <Link href={social.href} target="_blank" rel="noopener noreferrer">
      <button
        className={`group flex items-center text-normal font-medium font-rethink-sans px-4 py-1 rounded-lg gap-2
        ${social.text} ${social.bg} ${social.border} border transition hover:opacity-80 cursor-pointer`}
      >
        <span className="flex items-center justify-center">{animatedIcon}</span>
        <span className="relative inline-flex overflow-hidden">
          <div className="translate-y-0 skew-y-0 transition duration-500 group-hover:-translate-y-[125%] group-hover:skew-y-8">
            {social.label}
          </div>
          <div className="absolute top-0 left-0 translate-y-[125%] skew-y-8 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
            {social.label}
          </div>
        </span>
      </button>
    </Link>
  );
}
