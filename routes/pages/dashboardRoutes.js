const express = require('express');
const { getDashboard } = require('../../controllers/pages/dashboardPageController');

const router = express.Router();

router.get('/', getDashboard);

module.exports = router;
