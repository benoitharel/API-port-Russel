const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Répond selon le type de contenu négocié : callback html() ou json().
 */
function respondByType(req, res, { html, json }) {
  const type = req.accepts(['html', 'json']);
  if (type === 'html') {
    return html();
  }
  return json();
}

/**
 * POST /login
 * Vérifie les credentials, pose un cookie `token` httpOnly et répond
 * JSON `{token, user}` (client JSON) ou redirige `/dashboard` (form HTML).
 */
async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return respondByType(req, res, {
      html: () => res.redirect('/?error=1'),
      json: () => res.status(401).json({ message: 'Email ou mot de passe invalide' }),
    });
  }

  const user = await User.findOne({ email }).select('+password');
  const valid = user && (await user.comparePassword(password));

  if (!valid) {
    return respondByType(req, res, {
      html: () => res.redirect('/?error=1'),
      json: () => res.status(401).json({ message: 'Email ou mot de passe invalide' }),
    });
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

  return respondByType(req, res, {
    html: () => res.redirect('/dashboard'),
    json: () => res.status(200).json({ token, user: payload }),
  });
}

/**
 * GET /logout
 * Efface le cookie `token` puis redirige `/` (html) ou répond 200 JSON.
 */
function logout(req, res) {
  res.clearCookie('token');
  return respondByType(req, res, {
    html: () => res.redirect('/'),
    json: () => res.status(200).json({ message: 'Déconnexion réussie' }),
  });
}

module.exports = { login, logout };
