const jwt = require('jsonwebtoken');

/**
 * Lit le token JWT depuis la requête : cookie `token` en priorité,
 * sinon header `Authorization: Bearer <token>`.
 * @param {import('express').Request} req - Requête Express entrante.
 * @returns {string|null} Le token trouvé, ou null si absent.
 */
function getTokenFromRequest(req) {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }
  return null;
}

/**
 * Exige un JWT valide. Attache `req.user = { id, username, email }`.
 * Sinon : redirect `/` (HTML) ou 401 JSON (API), selon `req.accepts`.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @param {import('express').NextFunction} next - Callback pour passer la main au handler suivant.
 * @returns {void}
 */
function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return unauthorized(req, res);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, username: payload.username, email: payload.email };
    return next();
  } catch (err) {
    return unauthorized(req, res);
  }
}

/**
 * Répond à une requête non authentifiée : redirect `/` (HTML) ou 401 JSON (API).
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {void}
 */
function unauthorized(req, res) {
  const type = req.accepts(['html', 'json']);
  if (type === 'html') {
    return res.redirect('/');
  }
  return res.status(401).json({ message: 'Authentification requise' });
}

module.exports = { getTokenFromRequest, requireAuth };
