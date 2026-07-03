const express = require('express');
const { getDashboard } = require('../../controllers/pages/dashboardPageController');

const router = express.Router();

/** GET /dashboard — tableau de bord (réservations en cours). */
router.get('/', getDashboard);

module.exports = router;
