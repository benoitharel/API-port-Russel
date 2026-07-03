/**
 * 404 : route non trouvée. Négocie JSON (API) vs HTML (navigateur).
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {void}
 */
function notFoundHandler(req, res) {
  const type = req.accepts(['html', 'json']);
  if (type === 'html') {
    return res.status(404).render('error', { status: 404, message: 'Page introuvable' });
  }
  return res.status(404).json({ message: 'Route introuvable' });
}

/**
 * Handler d'erreurs centralisé. Mappe les erreurs Mongoose/Mongo connues
 * vers un statut HTTP explicite ; ne jamais renvoyer la stack au client.
 * @param {Error} err - Erreur propagée via `next(err)`.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @param {import('express').NextFunction} next - Non utilisé, requis par la signature Express des middlewares d'erreur.
 * @returns {void}
 */
function errorHandler(err, req, res, next) {
  console.error(err);

  let status = 500;
  let message = 'Erreur interne du serveur';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = 'Ressource déjà existante';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Identifiant invalide';
  }

  const type = req.accepts(['html', 'json']);
  if (type === 'html') {
    return res.status(status).render('error', { status, message });
  }
  return res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
