const express = require("express");
const next = require("next");
const { PrismaClient } = require("./prisma/app/generated/prisma/client");
require("dotenv").config();

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

// Prisma Client instance
const prisma = new PrismaClient();

async function startServer() {
  try {
    console.log("🚀 Connexion à la base de données...");
    await prisma.$connect();
    console.log("✅ Connexion BDD réussie !");

    await app.prepare();
    const server = express();

    // Ajoutez cette ligne pour analyser le corps des requêtes
    server.use(express.json({ limit: "30mb" }));
    server.use(express.urlencoded({ extended: true, limit: "30mb" }));

    // Middleware pour gérer les CORS
    server.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      if (req.method === "OPTIONS") {
        return res.status(200).end();
      }
      next();
    });

    // Servir les fichiers statiques
    server.use(express.static("public"));

    // Déléguez toutes les requêtes à Next.js
    server.all("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`✨ Serveur prêt sur http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur :", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

startServer();

// next\server.js
// const { createServer } = require('http');
// const { parse } = require('url');
// const next = require('next');

// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
// const handle = app.getRequestHandler();

// // Augmenter la limite de taille pour les requêtes
// const bodyParser = require('body-parser');

// app.prepare().then(() => {
//   createServer((req, res) => {
//     // Augmenter les limites pour les requêtes entrantes
//     if (req.url.startsWith('/api/actions-creations/photos')) {
//       // Augmenter la limite pour cette route spécifique
//       res.setHeader('x-max-body-size', '30mb');
//     }

//     // Gérer la demande via Next.js
//     const parsedUrl = parse(req.url, true);
//     handle(req, res, parsedUrl);
//   }).listen(3001, (err) => {
//     if (err) throw err;
//     console.log('> Ready on http://localhost:3001');
//   });
// });
