const Catway = require('../../models/Catway');

/**
 * Parse le paramètre :id (catwayNumber) d'une route catway/réservation.
 * @param {string} idParam - Valeur brute du paramètre de route.
 * @returns {number|null} Le nombre, ou null si invalide (NaN).
 */
function parseCatwayNumber(idParam) {
  const catwayNumber = Number(idParam);
  return Number.isNaN(catwayNumber) ? null : catwayNumber;
}

/**
 * Recherche un catway par son catwayNumber.
 * @param {number} catwayNumber - Numéro du catway recherché.
 * @returns {Promise<import('mongoose').Document|null>} Le document catway, ou null si introuvable.
 */
async function findCatwayByNumber(catwayNumber) {
  return Catway.findOne({ catwayNumber });
}

module.exports = { parseCatwayNumber, findCatwayByNumber };
