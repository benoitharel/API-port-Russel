/**
 * GET /
 * Page d'accueil publique : présentation + formulaire de connexion.
 * `loginError` est déduit de la query string (`?error=1`, posée par le
 * redirect de POST /login en cas d'échec).
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {void}
 */
function getHome(req, res) {
  const loginError = req.query.error === '1';
  res.render('index', { loginError });
}

module.exports = { getHome };
