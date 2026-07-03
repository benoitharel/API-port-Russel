const User = require('../../models/User');

// Duplique volontairement ../userController.js (dashboard HTML vs API JSON) — ne pas factoriser en service partagé.

const EMAIL_RE = /^\S+@\S+\.\S+$/;

async function list(req, res) {
  const users = await User.find().sort({ username: 1 });
  res.render('users/list', { users });
}

async function show(req, res) {
  const email = decodeURIComponent(req.params.email);
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).render('error', { status: 404, message: 'Utilisateur introuvable' });
  }
  res.render('users/show', { user });
}

function newForm(req, res) {
  res.render('users/new', { errors: [], values: {} });
}

async function create(req, res) {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || !username.trim()) {
    errors.push('username requis');
  }
  if (!email || !EMAIL_RE.test(email)) {
    errors.push('email requis et doit être valide');
  }
  if (!password || password.length < 6) {
    errors.push('password requis et doit contenir au moins 6 caractères');
  }

  if (errors.length === 0) {
    const existing = await User.findOne({ email });
    if (existing) {
      errors.push('email déjà utilisé');
    }
  }

  if (errors.length > 0) {
    return res.status(400).render('users/new', { errors, values: req.body });
  }

  await User.create({ username, email, password });
  res.redirect('/dashboard/users');
}

async function editForm(req, res) {
  const email = decodeURIComponent(req.params.email);
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).render('error', { status: 404, message: 'Utilisateur introuvable' });
  }
  res.render('users/edit', { user, originalEmail: user.email, errors: [] });
}

async function update(req, res) {
  const email = decodeURIComponent(req.params.email);
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).render('error', { status: 404, message: 'Utilisateur introuvable' });
  }

  const { username, email: newEmail, password } = req.body;
  const errors = [];

  if (!username || !username.trim()) {
    errors.push('username requis');
  }
  if (!newEmail || !EMAIL_RE.test(newEmail)) {
    errors.push('email requis et doit être valide');
  }
  if (password && password.length < 6) {
    errors.push('password doit contenir au moins 6 caractères');
  }

  if (errors.length === 0 && newEmail !== user.email) {
    const existing = await User.findOne({ email: newEmail });
    if (existing) {
      errors.push('email déjà utilisé');
    }
  }

  if (errors.length > 0) {
    return res.status(400).render('users/edit', {
      user: { ...user.toObject(), username, email: newEmail },
      originalEmail: email,
      errors,
    });
  }

  user.username = username;
  user.email = newEmail;
  if (password) {
    user.password = password;
  }
  await user.save();

  res.redirect(`/dashboard/users/${encodeURIComponent(user.email)}`);
}

async function deleteUser(req, res) {
  const email = decodeURIComponent(req.params.email);
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).render('error', { status: 404, message: 'Utilisateur introuvable' });
  }

  await User.deleteOne({ email });
  res.redirect('/dashboard/users');
}

module.exports = { list, show, newForm, create, editForm, update, deleteUser };
