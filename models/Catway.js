const mongoose = require('mongoose');

const catwaySchema = new mongoose.Schema(
  {
    /** Numéro du catway, identifiant métier unique (utilisé comme :id dans les routes). */
    catwayNumber: { type: Number, required: true, unique: true },
    /** Type de catway : long ou short. */
    catwayType: { type: String, required: true, enum: ['long', 'short'] },
    /** État courant du catway (texte libre, ex. "bon état"). */
    catwayState: { type: String, required: true, trim: true, minlength: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Catway', catwaySchema);
