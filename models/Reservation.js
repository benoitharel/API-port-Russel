const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    /** Numéro du catway réservé. Clé métier, pas de ref Mongoose vers Catway. */
    catwayNumber: { type: Number, required: true },
    /** Nom du client. */
    clientName: { type: String, required: true, trim: true },
    /** Nom du bateau. */
    boatName: { type: String, required: true, trim: true },
    /** Date de début de réservation. */
    startDate: { type: Date, required: true },
    /** Date de fin de réservation, doit être postérieure à startDate. */
    endDate: {
      type: Date,
      required: true,
      validate: {
        /**
         * Vérifie que endDate est bien postérieure à startDate sur ce document.
         * @param {Date} v - Valeur candidate de endDate.
         * @returns {boolean} true si endDate est valide.
         */
        validator: function (v) {
          return this.startDate < v;
        },
        message: 'endDate doit être postérieure à startDate',
      },
    },
  },
  { timestamps: true }
);

/** Index composé non-unique pour accélérer les recherches de chevauchement par catway. */
reservationSchema.index({ catwayNumber: 1, startDate: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
