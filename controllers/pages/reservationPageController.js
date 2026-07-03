const Catway = require('../../models/Catway');
const Reservation = require('../../models/Reservation');

// Duplique volontairement ../reservationController.js (dashboard HTML vs API JSON) — ne pas factoriser en service partagé.

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
 * @param {import('mongoose').Types.ObjectId} id - Identifiant de la réservation concernée.
 * @param {'list'|'show'} from - Page d'origine de la navigation.
 * @returns {string} L'URL de retour.
 */
function resolveCancelUrl(id, from) {
  return from === 'list' ? '/dashboard/reservations' : `/dashboard/reservations/${id}`;
}

/**
 * Recherche une réservation existante qui chevauche la période donnée sur un catway.
 * @param {number} catwayNumber - Catway concerné.
 * @param {Date} startDate - Début de la période à vérifier.
 * @param {Date} endDate - Fin de la période à vérifier.
 * @param {import('mongoose').Types.ObjectId} [excludeReservationId] - Réservation à exclure de la recherche (cas d'une mise à jour).
 * @returns {Promise<import('mongoose').Document|null>} La réservation en conflit, ou null si aucune.
 */
async function checkOverlap(catwayNumber, startDate, endDate, excludeReservationId) {
  return Reservation.findOne({
    catwayNumber,
    _id: { $ne: excludeReservationId },
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  });
}

/**
 * Valide catwayNumber, clientName, boatName, startDate, endDate depuis le body.
 * @param {object} body - Corps de la requête.
 * @returns {{error: string}|{catwayNumber: number, clientName: string, boatName: string, startDate: Date, endDate: Date}} L'erreur de validation, ou les champs parsés.
 */
function parseReservationBody(body) {
  const { catwayNumber, clientName, boatName, startDate, endDate } = body;

  const number = Number(catwayNumber);
  if (catwayNumber === undefined || catwayNumber === '' || Number.isNaN(number)) {
    return { error: 'catwayNumber requis et doit être un nombre' };
  }
  if (!clientName || !clientName.trim()) {
    return { error: 'clientName requis' };
  }
  if (!boatName || !boatName.trim()) {
    return { error: 'boatName requis' };
  }
  if (!startDate || !endDate) {
    return { error: 'startDate et endDate requis' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: 'startDate et endDate doivent être des dates valides' };
  }
  if (start >= end) {
    return { error: 'startDate doit être antérieure à endDate' };
  }

  return { catwayNumber: number, clientName, boatName, startDate: start, endDate: end };
}

/**
 * GET /dashboard/reservations
 * Affiche la liste des réservations.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function list(req, res) {
  const reservations = await Reservation.find().sort({ startDate: 1 });
  res.render('reservations/list', { reservations });
}

/**
 * GET /dashboard/reservations/:id
 * Affiche le détail d'une réservation.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function show(req, res) {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return res.status(404).render('error', { status: 404, message: 'Réservation introuvable' });
  }
  res.render('reservations/show', { reservation });
}

/**
 * GET /dashboard/reservations/new
 * Affiche le formulaire de création d'une réservation.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function newForm(req, res) {
  const catways = await Catway.find().sort({ catwayNumber: 1 });
  res.render('reservations/new', { catways, errors: [], values: {} });
}

/**
 * POST /dashboard/reservations
 * Traite la soumission du formulaire de création. Rejette (409) les chevauchements de dates.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function create(req, res) {
  const parsed = parseReservationBody(req.body);
  if (parsed.error) {
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    return res.status(400).render('reservations/new', { catways, errors: [parsed.error], values: req.body });
  }

  const catway = await Catway.findOne({ catwayNumber: parsed.catwayNumber });
  if (!catway) {
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    return res.status(404).render('reservations/new', { catways, errors: ['Catway introuvable'], values: req.body });
  }

  const overlap = await checkOverlap(parsed.catwayNumber, parsed.startDate, parsed.endDate);
  if (overlap) {
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    return res.status(409).render('reservations/new', {
      catways,
      errors: ['Chevauchement avec une réservation existante'],
      values: req.body,
    });
  }

  await Reservation.create({
    catwayNumber: parsed.catwayNumber,
    clientName: parsed.clientName,
    boatName: parsed.boatName,
    startDate: parsed.startDate,
    endDate: parsed.endDate,
  });
  res.redirect('/dashboard/reservations');
}

/**
 * GET /dashboard/reservations/:id/edit
 * Affiche le formulaire d'édition d'une réservation.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function editForm(req, res) {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return res.status(404).render('error', { status: 404, message: 'Réservation introuvable' });
  }
  const catways = await Catway.find().sort({ catwayNumber: 1 });
  const from = normalizeFrom(req.query.from);
  res.render('reservations/edit', {
    reservation,
    catways,
    errors: [],
    from,
    cancelUrl: resolveCancelUrl(reservation._id, from),
  });
}

/**
 * POST /dashboard/reservations/:id
 * Traite la soumission du formulaire d'édition. Rejette (409) les chevauchements de dates.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function update(req, res) {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return res.status(404).render('error', { status: 404, message: 'Réservation introuvable' });
  }

  const from = normalizeFrom(req.body.from);
  const cancelUrl = resolveCancelUrl(reservation._id, from);
  const catways = await Catway.find().sort({ catwayNumber: 1 });

  const parsed = parseReservationBody(req.body);
  if (parsed.error) {
    return res.status(400).render('reservations/edit', {
      reservation,
      catways,
      errors: [parsed.error],
      from,
      cancelUrl,
    });
  }

  const catway = await Catway.findOne({ catwayNumber: parsed.catwayNumber });
  if (!catway) {
    return res.status(404).render('reservations/edit', {
      reservation,
      catways,
      errors: ['Catway introuvable'],
      from,
      cancelUrl,
    });
  }

  const overlap = await checkOverlap(parsed.catwayNumber, parsed.startDate, parsed.endDate, reservation._id);
  if (overlap) {
    return res.status(409).render('reservations/edit', {
      reservation,
      catways,
      errors: ['Chevauchement avec une réservation existante'],
      from,
      cancelUrl,
    });
  }

  reservation.catwayNumber = parsed.catwayNumber;
  reservation.clientName = parsed.clientName;
  reservation.boatName = parsed.boatName;
  reservation.startDate = parsed.startDate;
  reservation.endDate = parsed.endDate;
  await reservation.save();

  res.redirect(`/dashboard/reservations/${reservation._id}`);
}

/**
 * POST /dashboard/reservations/:id/delete
 * Supprime une réservation.
 * @param {import('express').Request} req - Requête Express entrante.
 * @param {import('express').Response} res - Réponse Express.
 * @returns {Promise<void>}
 */
async function deleteReservation(req, res) {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return res.status(404).render('error', { status: 404, message: 'Réservation introuvable' });
  }
  await Reservation.deleteOne({ _id: reservation._id });
  res.redirect('/dashboard/reservations');
}

module.exports = { list, show, newForm, create, editForm, update, deleteReservation };
