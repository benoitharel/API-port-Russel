# API Port de Plaisance Russell

API privée (Express + MongoDB) et tableau de bord (EJS) pour la gestion des catways et des réservations du port de plaisance de Russell.

## Stack

- Express 5, Mongoose 9, EJS
- Authentification JWT (cookie httpOnly)
- Documentation API via Swagger (`/api-docs`)
- Hébergement : Vercel + MongoDB Atlas

## Installation locale

```bash
git clone https://github.com/benoitharel/API-port-Russel.git
cd API-port-Russel
npm install
cp .env.example .env   # renseigner MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN
npm run seed            # importe catways/reservations + crée le compte de démo
npm run dev
```

L'application est alors disponible sur `http://localhost:3000`.

## Scripts npm disponibles

- `npm run dev` — démarre le serveur avec nodemon (rechargement à chaud, usage local uniquement)
- `npm start` — démarre le serveur en mode standard (`node server.js`)
- `npm run seed` — réimporte les catways et réservations de démonstration (**destructif** : vide puis recharge ces deux collections) et crée/réinitialise le compte de démo (idempotent, sans effacer les autres comptes utilisateurs). Ne jamais l'exécuter contre une base de production dont on veut conserver les données.

## Liens

- Dépôt GitHub : https://github.com/benoitharel/API-port-Russel
- Application déployée : https://api-port-russel-eta.vercel.app/
- Documentation API (Swagger) : https://api-port-russel-eta.vercel.app/api-docs
- Compte de démo : `demo@port-russell.fr` / `Demo1234!`
