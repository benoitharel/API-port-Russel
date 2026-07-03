const Catway = require('../../models/Catway');

/**
 * Parse le paramètre :id (catwayNumber) d'une route catway/réservation.
 * Retourne le nombre, ou null si invalide (NaN).
 */
function parseCatwayNumber(idParam) {
  const catwayNumber = Number(idParam);
  return Number.isNaN(catwayNumber) ? null : catwayNumber;
}

/**
 * Recherche un catway par son catwayNumber.
 */
async function findCatwayByNumber(catwayNumber) {
  return Catway.findOne({ catwayNumber });
}

module.exports = { parseCatwayNumber, findCatwayByNumber };
