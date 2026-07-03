const Catway = require('../models/Catway');
const Reservation = require('../models/Reservation');
const { parseCatwayNumber, findCatwayByNumber } = require('./helpers/catwayLookup');

/**
 * GET /catways
 */
async function getAllCatways(req, res, next) {
  const catways = await Catway.find();
  return res.status(200).json(catways);
}

/**
 * GET /catways/:id
 */
async function getCatwayById(req, res, next) {
  const catwayNumber = parseCatwayNumber(req.params.id);
  if (catwayNumber === null) {
    return res.status(400).json({ message: 'id invalide' });
  }

  const catway = await findCatwayByNumber(catwayNumber);
  if (!catway) {
    return res.status(404).json({ message: 'Catway introuvable' });
  }

  return res.status(200).json(catway);
}

/**
 * POST /catways
 */
async function createCatway(req, res, next) {
  const { catwayNumber, catwayType, catwayState } = req.body;

  const number = Number(catwayNumber);
  if (catwayNumber === undefined || Number.isNaN(number)) {
    return res.status(400).json({ message: 'catwayNumber requis et doit être un nombre' });
  }
  if (!['long', 'short'].includes(catwayType)) {
    return res.status(400).json({ message: "catwayType requis, doit être 'long' ou 'short'" });
  }
  if (!catwayState || !catwayState.trim()) {
    return res.status(400).json({ message: 'catwayState requis' });
  }

  const existing = await Catway.findOne({ catwayNumber: number });
  if (existing) {
    return res.status(409).json({ message: 'catwayNumber déjà utilisé' });
  }

  const catway = await Catway.create({ catwayNumber: number, catwayType, catwayState });
  return res.status(201).json(catway);
}

/**
 * PUT /catways/:id
 * Seul catwayState est pris en compte ; catwayNumber/catwayType sont ignorés.
 */
async function updateCatwayState(req, res, next) {
  const catwayNumber = parseCatwayNumber(req.params.id);
  if (catwayNumber === null) {
    return res.status(400).json({ message: 'id invalide' });
  }

  const catway = await findCatwayByNumber(catwayNumber);
  if (!catway) {
    return res.status(404).json({ message: 'Catway introuvable' });
  }

  const { catwayState } = req.body;
  if (!catwayState || !catwayState.trim()) {
    return res.status(400).json({ message: 'catwayState requis' });
  }

  catway.catwayState = catwayState;
  await catway.save();

  return res.status(200).json(catway);
}

/**
 * DELETE /catways/:id
 */
async function deleteCatway(req, res, next) {
  const catwayNumber = parseCatwayNumber(req.params.id);
  if (catwayNumber === null) {
    return res.status(400).json({ message: 'id invalide' });
  }

  const catway = await findCatwayByNumber(catwayNumber);
  if (!catway) {
    return res.status(404).json({ message: 'Catway introuvable' });
  }

  const reservationsCount = await Reservation.countDocuments({ catwayNumber });
  if (reservationsCount > 0) {
    return res.status(409).json({ message: 'Catway possède des réservations existantes' });
  }

  await Catway.deleteOne({ catwayNumber });
  return res.status(204).send();
}

module.exports = {
  getAllCatways,
  getCatwayById,
  createCatway,
  updateCatwayState,
  deleteCatway,
};
