const User = require('../models/User');

// Duplique volontairement controllers/pages/userPageController.js (API JSON vs dashboard HTML) — ne pas factoriser en service partagé.

/**
 * Recherche un utilisateur par email.
 * @param {string} email - Email recherché.
 * @returns {Promise<import('mongoose').Document|null>} Le document utilisateur, ou null si introuvable.
 */
async function findUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * GET /users
 * Liste tous les utilisateurs.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function getAllUsers(req, res, next) {
  const users = await User.find();
  return res.status(200).json(users);
}

/**
 * GET /users/:email
 * Récupère un utilisateur par son email (`req.params.email`, URL-encodé).
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function getUserByEmail(req, res, next) {
  const email = decodeURIComponent(req.params.email);

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur introuvable' });
  }

  return res.status(200).json(user);
}

/**
 * POST /users
 * Crée un utilisateur. Body `{username, email, password}`.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function createUser(req, res, next) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email et password requis' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'password doit contenir au moins 6 caractères' });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'email déjà utilisé' });
  }

  const user = await User.create({ username, email, password });
  user.password = undefined;

  return res.status(201).json(user);
}

/**
 * PUT /users/:email
 * Body partiel { username?, email?, password? }.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function updateUser(req, res, next) {
  const email = decodeURIComponent(req.params.email);

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur introuvable' });
  }

  const { username, email: newEmail, password } = req.body;

  if (newEmail !== undefined && newEmail !== user.email) {
    const existing = await findUserByEmail(newEmail);
    if (existing) {
      return res.status(409).json({ message: 'email déjà utilisé' });
    }
    user.email = newEmail;
  }

  if (username !== undefined) {
    user.username = username;
  }

  if (password !== undefined) {
    if (password.length < 6) {
      return res.status(400).json({ message: 'password doit contenir au moins 6 caractères' });
    }
    user.password = password;
  }

  await user.save();
  user.password = undefined;

  return res.status(200).json(user);
}

/**
 * DELETE /users/:email
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function deleteUser(req, res, next) {
  const email = decodeURIComponent(req.params.email);

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur introuvable' });
  }

  await User.deleteOne({ email });
  return res.status(204).send();
}

module.exports = {
  getAllUsers,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
};
