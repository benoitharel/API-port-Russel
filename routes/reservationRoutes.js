const express = require('express');
const {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservationController');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /catways/{id}/reservations:
 *   get:
 *     summary: Liste les réservations d'un catway
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: catwayNumber du catway
 *     responses:
 *       200:
 *         description: Liste des réservations du catway
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: id invalide
 *       401:
 *         description: Authentification requise
 *       404:
 *         description: Catway introuvable
 */
router.get('/', getAllReservations);

/**
 * @swagger
 * /catways/{id}/reservations/{idReservation}:
 *   get:
 *     summary: Récupère une réservation d'un catway
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: catwayNumber du catway
 *       - in: path
 *         name: idReservation
 *         required: true
 *         schema: { type: string }
 *         description: _id Mongo de la réservation
 *     responses:
 *       200:
 *         description: Réservation trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: id ou idReservation invalide
 *       401:
 *         description: Authentification requise
 *       404:
 *         description: Catway ou réservation introuvable
 */
router.get('/:idReservation', getReservationById);

/**
 * @swagger
 * /catways/{id}/reservations:
 *   post:
 *     summary: Crée une réservation sur un catway
 *     description: Refuse la création (409) si les dates chevauchent une réservation existante sur ce même catway.
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: catwayNumber du catway
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientName, boatName, startDate, endDate]
 *             properties:
 *               clientName: { type: string }
 *               boatName: { type: string }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Réservation créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Champs manquants ou invalides
 *       401:
 *         description: Authentification requise
 *       404:
 *         description: Catway introuvable
 *       409:
 *         description: Chevauchement avec une réservation existante
 */
router.post('/', createReservation);

/**
 * @swagger
 * /catways/{id}/reservations/{idReservation}:
 *   put:
 *     summary: Met à jour une réservation
 *     description: Refuse la mise à jour (409) si les nouvelles dates chevauchent une autre réservation existante sur ce même catway.
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: catwayNumber du catway
 *       - in: path
 *         name: idReservation
 *         required: true
 *         schema: { type: string }
 *         description: _id Mongo de la réservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientName, boatName, startDate, endDate]
 *             properties:
 *               clientName: { type: string }
 *               boatName: { type: string }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Réservation mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Champs manquants ou invalides
 *       401:
 *         description: Authentification requise
 *       404:
 *         description: Catway ou réservation introuvable
 *       409:
 *         description: Chevauchement avec une réservation existante
 */
router.put('/:idReservation', updateReservation);

/**
 * @swagger
 * /catways/{id}/reservations/{idReservation}:
 *   delete:
 *     summary: Supprime une réservation
 *     tags: [Reservations]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: catwayNumber du catway
 *       - in: path
 *         name: idReservation
 *         required: true
 *         schema: { type: string }
 *         description: _id Mongo de la réservation
 *     responses:
 *       204:
 *         description: Réservation supprimée
 *       400:
 *         description: catwayNumber (id) invalide
 *       401:
 *         description: Authentification requise
 *       404:
 *         description: Réservation introuvable
 */
router.delete('/:idReservation', deleteReservation);

module.exports = router;
