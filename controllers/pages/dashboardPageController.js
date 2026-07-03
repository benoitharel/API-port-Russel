const Reservation = require('../../models/Reservation');

async function getDashboard(req, res) {
  const now = new Date();
  const currentReservations = await Reservation.find({
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ catwayNumber: 1 });

  res.render('dashboard', { user: req.user, today: now, currentReservations });
}

module.exports = { getDashboard };
