const Catway = require('../../models/Catway');
const Reservation = require('../../models/Reservation');

// Duplique volontairement ../catwayController.js (dashboard HTML vs API JSON) — ne pas factoriser en service partagé.

/**
 * Normalise le paramètre `from` de navigation (list/show) vers une valeur connue.
 * @param {string} value - Valeur brute reçue en query/body.
 * @returns {'list'|'show'} La valeur normalisée.
 */
function normalizeFrom(value) {
  return value === 'list' ? 'list' : 'show';
}

/**
 * Calcule l'URL vers laquelle rediriger le bouton Annuler d'un formulaire d'édition.
 * @param {number} catwayNumber - Catway concerné.
 * @param {'list'|'show'} from - Page d'origine de la navigation.
 * @returns {string} L'URL de retour.
 */
function resolveCancelUrl(catwayNumber, from) {
  return from === 'list' ? '/dashboard/catways' : `/dashboard/catways/${catwayNumber}`;
}

/**
 * GET /dashboard/catways
 * Affiche la liste des catways.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function list(req, res) {
  const catways = await Catway.find().sort({ catwayNumber: 1 });
  res.render('catways/list', { catways });
}

/**
 * GET /dashboard/catways/:id
 * Affiche le détail d'un catway.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function show(req, res) {
  const catwayNumber = Number(req.params.id);
  const catway = await Catway.findOne({ catwayNumber });
  if (!catway) {
    return res.status(404).render('error', { status: 404, message: 'Catway introuvable' });
  }
  res.render('catways/show', { catway });
}

/**
 * GET /dashboard/catways/new
 * Affiche le formulaire de création d'un catway.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {void}
 */
function newForm(req, res) {
  res.render('catways/new', { errors: [], values: {} });
}

/**
 * POST /dashboard/catways
 * Traite la soumission du formulaire de création d'un catway.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function create(req, res) {
  const { catwayNumber, catwayType, catwayState } = req.body;
  const errors = [];

  const number = Number(catwayNumber);
  if (catwayNumber === undefined || catwayNumber === '' || Number.isNaN(number)) {
    errors.push('catwayNumber requis et doit être un nombre');
  }
  if (!['long', 'short'].includes(catwayType)) {
    errors.push("catwayType requis, doit être 'long' ou 'short'");
  }
  if (!catwayState || !catwayState.trim()) {
    errors.push('catwayState requis');
  }

  if (errors.length === 0) {
    const existing = await Catway.findOne({ catwayNumber: number });
    if (existing) {
      errors.push('catwayNumber déjà utilisé');
    }
  }

  if (errors.length > 0) {
    return res.status(400).render('catways/new', { errors, values: req.body });
  }

  await Catway.create({ catwayNumber: number, catwayType, catwayState });
  res.redirect('/dashboard/catways');
}

/**
 * GET /dashboard/catways/:id/edit
 * Affiche le formulaire d'édition d'un catway.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function editForm(req, res) {
  const catwayNumber = Number(req.params.id);
  const catway = await Catway.findOne({ catwayNumber });
  if (!catway) {
    return res.status(404).render('error', { status: 404, message: 'Catway introuvable' });
  }
  const from = normalizeFrom(req.query.from);
  res.render('catways/edit', { catway, errors: [], from, cancelUrl: resolveCancelUrl(catwayNumber, from) });
}

/**
 * POST /dashboard/catways/:id
 * Traite la soumission du formulaire d'édition (seul catwayState est modifiable).
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function update(req, res) {
  const catwayNumber = Number(req.params.id);
  const catway = await Catway.findOne({ catwayNumber });
  if (!catway) {
    return res.status(404).render('error', { status: 404, message: 'Catway introuvable' });
  }

  const { catwayState, from: bodyFrom } = req.body;
  const from = normalizeFrom(bodyFrom);
  if (!catwayState || !catwayState.trim()) {
    return res.status(400).render('catways/edit', {
      catway,
      errors: ['catwayState requis'],
      from,
      cancelUrl: resolveCancelUrl(catwayNumber, from),
    });
  }

  catway.catwayState = catwayState;
  await catway.save();

  res.redirect(`/dashboard/catways/${catwayNumber}`);
}

/**
 * POST /dashboard/catways/:id/delete
 * Supprime un catway. Bloqué (409) si des réservations existent — pas de cascade.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function deleteCatway(req, res) {
  const catwayNumber = Number(req.params.id);
  const catway = await Catway.findOne({ catwayNumber });
  if (!catway) {
    return res.status(404).render('error', { status: 404, message: 'Catway introuvable' });
  }

  const reservationsCount = await Reservation.countDocuments({ catwayNumber });
  if (reservationsCount > 0) {
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    return res.status(409).render('catways/list', {
      catways,
      error: 'Impossible de supprimer un catway avec des réservations existantes',
    });
  }

  await Catway.deleteOne({ catwayNumber });
  res.redirect('/dashboard/catways');
}

module.exports = { list, show, newForm, create, editForm, update, deleteCatway };
