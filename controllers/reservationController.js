const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const { parseCatwayNumber, findCatwayByNumber } = require('./helpers/catwayLookup');

// Duplique volontairement controllers/pages/reservationPageController.js (API JSON vs dashboard HTML) — ne pas factoriser en service partagé.

/**
 * Recherche une réservation existante qui chevauche la période donnée sur un catway.
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
 * Valide clientName, boatName, startDate, endDate depuis le body.
 * Retourne { error: string } ou { clientName, boatName, startDate, endDate }.
 */
function parseReservationBody(body) {
  const { clientName, boatName, startDate, endDate } = body;

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

  return { clientName, boatName, startDate: start, endDate: end };
}

/**
 * GET /catways/:id/reservations
 */
async function getAllReservations(req, res, next) {
  const catwayNumber = parseCatwayNumber(req.params.id);
  if (catwayNumber === null) {
    return res.status(400).json({ message: 'id invalide' });
  }

  const catway = await findCatwayByNumber(catwayNumber);
  if (!catway) {
    return res.status(404).json({ message: 'Catway introuvable' });
  }

  const reservations = await Reservation.find({ catwayNumber });
  return res.status(200).json(reservations);
}

/**
 * GET /catways/:id/reservations/:idReservation
 */
async function getReservationById(req, res, next) {
  const catwayNumber = parseCatwayNumber(req.params.id);
  if (catwayNumber === null) {
    return res.status(400).json({ message: 'id invalide' });
  }

  const catway = await findCatwayByNumber(catwayNumber);
  if (!catway) {
    return res.status(404).json({ message: 'Catway introuvable' });
  }

  const { idReservation } = req.params;
  if (!mongoose.Types.ObjectId.isValid(idReservation)) {
    return res.status(400).json({ message: 'idReservation invalide' });
  }

  const reservation = await Reservation.findOne({ _id: idReservation, catwayNumber });
  if (!reservation) {
    return res.status(404).json({ message: 'Réservation introuvable' });
  }

  return res.status(200).json(reservation);
}

/**
 * POST /catways/:id/reservations
 */
async function createReservation(req, res, next) {
  const catwayNumber = parseCatwayNumber(req.params.id);
  if (catwayNumber === null) {
    return res.status(400).json({ message: 'id invalide' });
  }

  const catway = await findCatwayByNumber(catwayNumber);
  if (!catway) {
    return res.status(404).json({ message: 'Catway introuvable' });
  }

  const parsed = parseReservationBody(req.body);
  if (parsed.error) {
    return res.status(400).json({ message: parsed.error });
  }

  const overlap = await checkOverlap(catwayNumber, parsed.startDate, parsed.endDate);
  if (overlap) {
    return res.status(409).json({ message: 'Chevauchement avec une réservation existante' });
  }

  const reservation = await Reservation.create({
    catwayNumber,
    clientName: parsed.clientName,
    boatName: parsed.boatName,
    startDate: parsed.startDate,
    endDate: parsed.endDate,
  });

  return res.status(201).json(reservation);
}

/**
 * PUT /catways/:id/reservations/:idReservation
 */
async function updateReservation(req, res, next) {
  const catwayNumber = parseCatwayNumber(req.params.id);
  if (catwayNumber === null) {
    return res.status(400).json({ message: 'id invalide' });
  }

  const catway = await findCatwayByNumber(catwayNumber);
  if (!catway) {
    return res.status(404).json({ message: 'Catway introuvable' });
  }

  const { idReservation } = req.params;
  if (!mongoose.Types.ObjectId.isValid(idReservation)) {
    return res.status(400).json({ message: 'idReservation invalide' });
  }

  const reservation = await Reservation.findOne({ _id: idReservation, catwayNumber });
  if (!reservation) {
    return res.status(404).json({ message: 'Réservation introuvable' });
  }

  const parsed = parseReservationBody(req.body);
  if (parsed.error) {
    return res.status(400).json({ message: parsed.error });
  }

  const overlap = await checkOverlap(catwayNumber, parsed.startDate, parsed.endDate, idReservation);
  if (overlap) {
    return res.status(409).json({ message: 'Chevauchement avec une réservation existante' });
  }

  reservation.clientName = parsed.clientName;
  reservation.boatName = parsed.boatName;
  reservation.startDate = parsed.startDate;
  reservation.endDate = parsed.endDate;
  await reservation.save();

  return res.status(200).json(reservation);
}

/**
 * DELETE /catways/:id/reservations/:idReservation
 */
async function deleteReservation(req, res, next) {
  const catwayNumber = Number(req.params.id);
  if (Number.isNaN(catwayNumber)) {
    return res.status(400).json({ message: 'id invalide' });
  }

  const { idReservation } = req.params;
  if (!mongoose.Types.ObjectId.isValid(idReservation)) {
    return res.status(404).json({ message: 'Réservation introuvable' });
  }

  const reservation = await Reservation.findOneAndDelete({ _id: idReservation, catwayNumber });
  if (!reservation) {
    return res.status(404).json({ message: 'Réservation introuvable' });
  }

  return res.status(204).send();
}

module.exports = {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  checkOverlap,
};
