/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "arnaudgct.fr",
        pathname: "/assets/img/dashboard/experiences/**", // Le chemin exact ou un joker pour autoriser tout le chemin
      },
    ],
  },
};

export default nextConfig;
