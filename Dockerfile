# Étape 1 : Build l'application
FROM node:22-alpine AS builder

WORKDIR /app

ARG API_TOKEN
ARG DATABASE_URL
ARG LETTERBOXD_USERNAME
ARG NEXT_PUBLIC_RESEND_API_KEY
ARG SPOTIFY_ACCESS_TOKEN
ARG SPOTIFY_CLIENT_ID
ARG SPOTIFY_CLIENT_SECRET
ARG SPOTIFY_REFRESH_TOKEN
ARG TMDB_API_KEY
ARG RESEND_API_KEY

ENV API_TOKEN=$API_TOKEN
ENV DATABASE_URL=$DATABASE_URL
ENV LETTERBOXD_USERNAME=$LETTERBOXD_USERNAME
ENV NEXT_PUBLIC_RESEND_API_KEY=$NEXT_PUBLIC_RESEND_API_KEY
ENV SPOTIFY_ACCESS_TOKEN=$SPOTIFY_ACCESS_TOKEN
ENV SPOTIFY_CLIENT_ID=$SPOTIFY_CLIENT_ID
ENV SPOTIFY_CLIENT_SECRET=$SPOTIFY_CLIENT_SECRET
ENV SPOTIFY_REFRESH_TOKEN=$SPOTIFY_REFRESH_TOKEN
ENV LETTERBOXD_USERNAME=$LETTERBOXD_USERNAME
ENV TMDB_API_KEY=$TMDB_API_KEY
ENV RESEND_API_KEY=$RESEND_API_KEY

# Installer deps
COPY package*.json ./
RUN npm install

# Copier le code et générer Prisma + build
COPY . .
RUN npx prisma generate
RUN npm run build

# Étape 2 : Image de prod
FROM node:22-alpine

WORKDIR /app

# Installer uniquement les deps prod
COPY package*.json ./
RUN npm install --only=production

# Copier le build et Prisma
COPY --from=builder /app ./

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
