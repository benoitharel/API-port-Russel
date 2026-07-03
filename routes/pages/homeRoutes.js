const express = require('express');
const { getHome } = require('../../controllers/pages/homePageController');

const router = express.Router();

/** GET / — page d'accueil publique et formulaire de connexion. */
router.get('/', getHome);

module.exports = router;
