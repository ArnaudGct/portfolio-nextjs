/**
 * Script pour récupérer automatiquement un refresh token Spotify.
 *
 * 1. Remplis CLIENT_ID, CLIENT_SECRET et SCOPES ci-dessous.
 * 2. Dans ton dashboard Spotify Developer (https://developer.spotify.com/dashboard),
 *    ouvre ton app > Settings > Redirect URIs, et ajoute exactement :
 *    http://127.0.0.1:8888/callback
 * 3. Lance : node get-spotify-refresh-token.js
 * 4. Un lien s'affiche dans le terminal, clique dessus, connecte-toi et accepte.
 * 5. Le script récupère automatiquement le code, l'échange contre les tokens,
 *    et affiche ton refresh_token dans le terminal.
 */

const http = require("http");

const CLIENT_ID = "4a428124464b4306a33a46138a098864";
const CLIENT_SECRET = "b44253552fee42f283c98fdb5272ac3a";
const REDIRECT_URI = "http://127.0.0.1:8891/callback";
const SCOPES = "user-read-private user-read-email"; // adapte selon tes besoins
const PORT = 8891;

const state = Math.random().toString(36).substring(2, 15);

const authUrl = new URL("https://accounts.spotify.com/authorize");
authUrl.search = new URLSearchParams({
  client_id: CLIENT_ID,
  response_type: "code",
  redirect_uri: REDIRECT_URI,
  scope: SCOPES,
  state,
}).toString();

console.log("\n👉 Ouvre ce lien dans ton navigateur pour autoriser l'app :\n");
console.log(authUrl.toString());
console.log("\nEn attente de l'autorisation...\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (url.pathname !== "/callback") {
    res.end("OK");
    return;
  }

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    res.end("Erreur d'autorisation, regarde le terminal.");
    console.error("❌ Erreur retournée par Spotify :", error);
    server.close();
    return;
  }

  if (returnedState !== state) {
    res.end("State mismatch, regarde le terminal.");
    console.error("❌ State invalide, requête suspecte ou tentative expirée.");
    server.close();
    return;
  }

  try {
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
        }),
      },
    );

    const data = await tokenResponse.json();

    if (data.error) {
      console.error("❌ Erreur lors de l'échange du code :", data);
      res.end("Erreur lors de l'échange du code, regarde le terminal.");
      server.close();
      return;
    }

    console.log("✅ Access token :", data.access_token);
    console.log("✅ Refresh token :", data.refresh_token);
    console.log("\nCopie le refresh_token dans ton .env, ex :");
    console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`);

    res.end("C'est bon, tu peux fermer cet onglet et revenir au terminal.");
  } catch (err) {
    console.error("❌ Erreur réseau :", err);
    res.end("Erreur réseau, regarde le terminal.");
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log(`Serveur local démarré sur http://127.0.0.1:${PORT}`);
});
