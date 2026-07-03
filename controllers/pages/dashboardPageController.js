const Reservation = require('../../models/Reservation');

/**
 * GET /dashboard
 * Affiche le tableau de bord : réservations en cours à l'instant présent.
 * @param {import('express').Request} req - Requête Express entrante (authentifiée, `req.user` renseigné).
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function getDashboard(req, res) {
  const now = new Date();
  const currentReservations = await Reservation.find({
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ catwayNumber: 1 });

  res.render('dashboard', { user: req.user, today: now, currentReservations });
}

module.exports = { getDashboard };
