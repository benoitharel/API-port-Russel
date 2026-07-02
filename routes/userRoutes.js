const express = require('express');
const {
  getAllUsers,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Liste tous les utilisateurs
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentification requise
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /users/{email}:
 *   get:
 *     summary: Récupère un utilisateur par email
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentification requise
 *       404:
 *         description: Utilisateur introuvable
 */
router.get('/:email', getUserByEmail);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crée un utilisateur
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Champs manquants ou invalides
 *       401:
 *         description: Authentification requise
 *       409:
 *         description: email déjà utilisé
 */
router.post('/', createUser);

/**
 * @swagger
 * /users/{email}:
 *   put:
 *     summary: Met à jour un utilisateur (body partiel)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string, format: email }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: password invalide
 *       401:
 *         description: Authentification requise
 *       404:
 *         description: Utilisateur introuvable
 *       409:
 *         description: email déjà utilisé
 */
router.put('/:email', updateUser);

/**
 * @swagger
 * /users/{email}:
 *   delete:
 *     summary: Supprime un utilisateur
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string, format: email }
 *     responses:
 *       204:
 *         description: Utilisateur supprimé
 *       401:
 *         description: Authentification requise
 *       404:
 *         description: Utilisateur introuvable
 */
router.delete('/:email', deleteUser);

module.exports = router;
