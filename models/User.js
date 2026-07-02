const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    /** Nom affiché de l'utilisateur. */
    username: { type: String, required: true, trim: true, minlength: 2 },
    /** Adresse email, unique, utilisée pour le login. */
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^\S+@\S+\.\S+$/,
    },
    /** Mot de passe haché ; jamais renvoyé par défaut dans les requêtes. */
    password: { type: String, required: true, minlength: 6, select: false },
  },
  { timestamps: true }
);

/**
 * Hache le mot de passe avant sauvegarde s'il a été modifié.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

/**
 * Compare un mot de passe en clair au mot de passe haché de l'utilisateur.
 * @param {string} candidate - Mot de passe en clair à vérifier.
 * @returns {Promise<boolean>} true si le mot de passe correspond.
 */
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
