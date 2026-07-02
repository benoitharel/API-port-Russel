const express = require('express');
const { getHome } = require('../../controllers/pages/homePageController');

const router = express.Router();

router.get('/', getHome);

module.exports = router;
