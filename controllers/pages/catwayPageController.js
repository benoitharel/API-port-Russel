const Catway = require('../../models/Catway');
const Reservation = require('../../models/Reservation');

function normalizeFrom(value) {
  return value === 'list' ? 'list' : 'show';
}

function resolveCancelUrl(catwayNumber, from) {
  return from === 'list' ? '/dashboard/catways' : `/dashboard/catways/${catwayNumber}`;
}

async function list(req, res) {
  const catways = await Catway.find().sort({ catwayNumber: 1 });
  res.render('catways/list', { catways });
}

async function show(req, res) {
  const catwayNumber = Number(req.params.id);
  const catway = await Catway.findOne({ catwayNumber });
  if (!catway) {
    return res.status(404).render('error', { status: 404, message: 'Catway introuvable' });
  }
  res.render('catways/show', { catway });
}

function newForm(req, res) {
  res.render('catways/new', { errors: [], values: {} });
}

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

async function editForm(req, res) {
  const catwayNumber = Number(req.params.id);
  const catway = await Catway.findOne({ catwayNumber });
  if (!catway) {
    return res.status(404).render('error', { status: 404, message: 'Catway introuvable' });
  }
  const from = normalizeFrom(req.query.from);
  res.render('catways/edit', { catway, errors: [], from, cancelUrl: resolveCancelUrl(catwayNumber, from) });
}

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
