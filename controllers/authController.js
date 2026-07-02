const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * POST /login
 * Vérifie les credentials, pose un cookie `token` httpOnly et répond
 * JSON `{token, user}` (client JSON) ou redirige `/dashboard` (form HTML).
 */
async function login(req, res, next) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  const valid = user && (await user.comparePassword(password));

  if (!valid) {
    const type = req.accepts(['html', 'json']);
    if (type === 'html') {
      return res.redirect('/?error=1');
    }
    return res.status(401).json({ message: 'Email ou mot de passe invalide' });
  }

  const payload = { id: user._id, username: user.username, email: user.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  const type = req.accepts(['html', 'json']);
  if (type === 'html') {
    return res.redirect('/dashboard');
  }
  return res.status(200).json({ token, user: payload });
}

/**
 * GET /logout
 * Efface le cookie `token` puis redirige `/` (html) ou répond 200 JSON.
 */
function logout(req, res) {
  res.clearCookie('token');
  const type = req.accepts(['html', 'json']);
  if (type === 'html') {
    return res.redirect('/');
  }
  return res.status(200).json({ message: 'Déconnexion réussie' });
}

module.exports = { login, logout };
