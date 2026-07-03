const User = require('../models/User');

/**
 * Recherche un utilisateur par email.
 */
async function findUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * GET /users
 */
async function getAllUsers(req, res, next) {
  const users = await User.find();
  return res.status(200).json(users);
}

/**
 * GET /users/:email
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
