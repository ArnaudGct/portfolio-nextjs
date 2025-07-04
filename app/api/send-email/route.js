import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { firstName, lastName, email, message } = await request.json();

    // Validation des données
    if (!firstName || !lastName || !email || !message) {
      return Response.json(
        { success: false, error: { message: "Tous les champs sont requis" } },
        { status: 400 }
      );
    }

    // Envoi de l'email
    const { data, error } = await resend.emails.send({
      from: "no-reply@arnaudgct.fr", // Remplacez par votre domaine vérifié
      to: ["contact@arnaudgct.fr"], // Votre email de destination
      subject: `Nouveau message de ${firstName} ${lastName}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${firstName} ${lastName}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
      text: `
        Nouveau message de contact
        
        Nom : ${firstName} ${lastName}
        Email : ${email}
        Message : ${message}
      `,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return Response.json(
        {
          success: false,
          error: { message: "Erreur lors de l'envoi de l'email" },
        },
        { status: 500 }
      );
    }

    return Response.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);
    return Response.json(
      { success: false, error: { message: "Erreur serveur" } },
      { status: 500 }
    );
  }
}
