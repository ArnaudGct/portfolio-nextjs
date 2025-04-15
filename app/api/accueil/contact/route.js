// app/api/accueil/contact/route.js
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, message } = body;

    // Validation simple
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Configuration du transporteur
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Envoi de l'email
    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"Formulaire de contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || "contact@arnaudgct.fr",
      replyTo: email,
      subject: `Nouveau message de ${firstName} ${lastName}`,
      text: `
        Nom: ${firstName} ${lastName}
        Email: ${email}
        
        Message:
        ${message}
      `,
      html: `
        <h2>Nouveau message du formulaire de contact</h2>
        <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${message.replace(/\n/g, "<br>")}
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Message envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur d'envoi d'email:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'envoi du message",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
