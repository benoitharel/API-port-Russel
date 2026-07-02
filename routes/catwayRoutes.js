const express = require('express');
const {
  getAllCatways,
  getCatwayById,
  createCatway,
  updateCatwayState,
  deleteCatway,
} = require('../controllers/catwayController');
const reservationRoutes = require('./reservationRoutes');

const router = express.Router();

/**
 * @swagger
 * /catways:
 *   get:
 *     summary: Liste tous les catways
 *     tags: [Catways]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des catways
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Catway'
 *       401:
 *         description: Authentification requise
 */
router.get('/', getAllCatways);

/**
 * @swagger
 * /catways/{id}:
 *   get:
 *     summary: Récupère un catway par son catwayNumber
 *     tags: [Catways]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: catwayNumber du catway
 *     responses:
 *       200:
 *         description: Catway trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Catway'
 *       400:
 *         description: id invalide
 *       401:
 *         description: Authentification requise
 *       404:
 *         description: Catway introuvable
 */
router.get('/:id', getCatwayById);

/**
 * @swagger
 * /catways:
 *   post:
 *     summary: Crée un catway
 *     tags: [Catways]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [catwayNumber, catwayType, catwayState]
 *             properties:
 *               catwayNumber: { type: integer }
 *               catwayType: { type: string, enum: [long, short] }
 *               catwayState: { type: string }
 *     responses:
 *       201:
 *         description: Catway créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Catway'
 *       400:
 *         description: Champs manquants ou invalides
 *       401:
 *         description: Authentification requise
 *       409:
 *         description: catwayNumber déjà utilisé
 */
router.post('/', createCatway);

/**
 * @swagger
 * /catways/{id}:
 *   put:
 *     summary: Met à jour l'état d'un catway (seul catwayState est pris en compte)
 *     description: Seul le champ catwayState est modifié ; catwayNumber et catwayType présents dans le body sont silencieusement ignorés.
 *     tags: [Catways]
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
 *             required: [catwayState]
 *             properties:
 *               catwayState: { type: string }
 *     responses:
 *       200:
 *         description: Catway mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Catway'
 *       400:
 *         description: id ou catwayState invalide
 *       401:
 *         description: Authentification requise
 *       404:
 *         description: Catway introuvable
 */
router.put('/:id', updateCatwayState);

/**
 * @swagger
 * /catways/{id}:
 *   delete:
 *     summary: Supprime un catway
 *     description: Refuse la suppression (409) si le catway a des réservations existantes ; pas de suppression en cascade.
 *     tags: [Catways]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: catwayNumber du catway
 *     responses:
 *       204:
 *         description: Catway supprimé
 *       400:
 *         description: id invalide
 *       401:
 *         description: Authentification requise
 *       404:
 *         description: Catway introuvable
 *       409:
 *         description: Le catway possède des réservations existantes
 */
router.delete('/:id', deleteCatway);
router.use('/:id/reservations', reservationRoutes);

module.exports = router;
