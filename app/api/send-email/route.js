export const runtime = "nodejs";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configurer le transporteur Nodemailer avec Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  debug: true, // Active le débogage nodemailer
});

export async function POST(request) {
  try {
    console.log("Début du traitement de la requête POST");

    // Vérifier que l'on peut lire le corps de la requête
    let requestBody;
    try {
      requestBody = await request.json();
      console.log("Corps de la requête:", requestBody);
    } catch (error) {
      console.error("Erreur lors du parsing du JSON:", error);
      return NextResponse.json(
        { error: "Format de requête invalide" },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, message } = requestBody;

    // Validation des champs
    if (!firstName || !lastName || !email || !message) {
      console.log("Validation échouée: champs manquants");
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    console.log("Préparation de l'email avec les données:", {
      firstName,
      lastName,
      email,
    });

    // Vérification des variables d'environnement
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Variables d'environnement manquantes");
      return NextResponse.json(
        { error: "Configuration du serveur incomplète" },
        { status: 500 }
      );
    }

    // Préparer le contenu de l'email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: "contact@arnaudgct.fr",
      subject: `Nouveau message de ${firstName} ${lastName}`,
      replyTo: email,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    console.log("Tentative d'envoi d'email...");

    // Envoyer l'email avec Nodemailer
    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès:", info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    return NextResponse.json(
      {
        error: "Erreur du serveur lors de l'envoi du message: " + error.message,
      },
      { status: 500 }
    );
  }
}
