import { NextResponse } from "next/server";

export function middleware(request) {
  // Pour les requêtes d'upload d'images
  if (request.nextUrl.pathname.includes("/api/actions-creations/photos")) {
    // Configurer les en-têtes CORS
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return response;
  }

  // Pour les requêtes OPTIONS (préflight CORS)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400", // 24 heures
      },
    });
  }

  return NextResponse.next();
}

// Configuration du matcher pour cibler les routes API
export const config = {
  matcher: ["/api/:path*"],
};
