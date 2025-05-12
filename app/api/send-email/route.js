import { NextResponse } from "next/server";
import { Resend } from "resend";

// Initialiser Resend avec votre clé API
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // Récupérer les données du formulaire
    const { firstName, lastName, email, message } = await request.json();

    // Validation des champs
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Envoyer l'email avec Resend
    const { data, error } = await resend.emails.send({
      from: "Portfolio <contact@arnaudgct.fr>", // Changez pour votre domaine vérifié sur Resend
      to: "contact@arnaudgct.fr", // Votre adresse email pour recevoir les messages
      subject: `Nouveau message de ${firstName} ${lastName}`,
      reply_to: email,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return NextResponse.json(
        { error: "Échec de l'envoi du message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: data.id });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur du serveur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
