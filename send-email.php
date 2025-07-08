<?php
// Autoriser les requêtes CORS (optionnel)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Lire le JSON envoyé depuis le frontend
$data = json_decode(file_get_contents("php://input"), true);

$firstName = trim($data["firstName"] ?? "");
$lastName = trim($data["lastName"] ?? "");
$email = trim($data["email"] ?? "");
$message = trim($data["message"] ?? "");

if (!$firstName || !$lastName || !$email || !$message) {
  http_response_code(400);
  echo json_encode(["error" => "Tous les champs sont requis."]);
  exit;
}

// Destinataire (ton adresse mail)
$to = "arnaud@arnaudgct.fr";

// Sujet du mail
$subject = "Nouveau message de $firstName $lastName";

// Entêtes du mail
$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

// Corps du message en HTML
$body = "
  <h2>Message de contact</h2>
  <p><strong>Nom :</strong> $firstName $lastName</p>
  <p><strong>Email :</strong> $email</p>
  <p><strong>Message :</strong><br>" . nl2br(htmlspecialchars($message)) . "</p>
";

// Envoi de l'email
if (mail($to, $subject, $body, $headers)) {
  echo json_encode(["success" => true]);
} else {
  http_response_code(500);
  echo json_encode(["error" => "Échec de l'envoi de l'email."]);
}
