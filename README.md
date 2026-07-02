# API Port de Plaisance Russell

API privée (Express + MongoDB) et tableau de bord (EJS) pour la gestion des réservations de catways du port de plaisance de Russell.

Projet en cours de construction — voir les [issues](../../issues) pour le détail des tâches.

## Stack

- Express 5, Mongoose 9, EJS
- Authentification JWT (cookie httpOnly)
- Documentation API via Swagger (`/api-docs`)
- Hébergement : Vercel + MongoDB Atlas

## Installation locale

```bash
npm install
cp .env.example .env   # renseigner MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN
npm run seed            # importe catways/reservations + crée le compte de démo
npm run dev
```

## Liens

- Application déployée : _à venir_
- Documentation API : `/api-docs`
- Compte de démo : _à venir_
