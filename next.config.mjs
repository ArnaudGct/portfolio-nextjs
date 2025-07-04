/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour les API
  serverExternalPackages: ["sharp"],
  reactStrictMode: true,

  // Pour gérer les uploads volumineux
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Ou spécifiez votre domaine
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  // Augmenter le timeout pour les requêtes API
  serverRuntimeConfig: {
    apiTimeout: 120000, // 2 minutes
  },

  images: {
    domains: [
      "localhost",
      "arnaudgct.fr",
      "i.scdn.co",
      "a.ltrbxd.com",
      "image.tmdb.org",
      "api.mapbox.com",
      "res.cloudinary.com",
    ],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "arnaudgct.fr",
        pathname: "/assets/img/dashboard/experiences/**", // Le chemin exact ou un joker pour autoriser tout le chemin
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
