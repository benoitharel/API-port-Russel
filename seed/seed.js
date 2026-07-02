require('dotenv').config();
const mongoose = require('mongoose');

const Catway = require('../models/Catway');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

const DEMO_USER = {
  username: 'Demo Capitainerie',
  email: 'demo@port-russell.fr',
  password: 'Demo1234!',
};

async function seed() {
  console.log('Ce script efface et régénère les collections catways et reservations.');

  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

  const catwaysData = require('./catways.json');
  if (!Array.isArray(catwaysData) || catwaysData.length === 0) {
    throw new Error('catways.json est vide ou invalide');
  }
  await Catway.deleteMany({});
  const catways = await Catway.insertMany(catwaysData);

  const reservationsData = require('./reservations.json');
  if (!Array.isArray(reservationsData) || reservationsData.length === 0) {
    throw new Error('reservations.json est vide ou invalide');
  }
  await Reservation.deleteMany({});
  const reservations = await Reservation.insertMany(reservationsData);

  let demoUser = await User.findOne({ email: DEMO_USER.email });
  // username/password volontairement réinitialisés à chaque run pour garantir
  // des identifiants de démo toujours connus (Demo1234!), y compris si un test
  // manuel les a changés en base.
  if (!demoUser) {
    demoUser = new User(DEMO_USER);
  } else {
    demoUser.username = DEMO_USER.username;
    demoUser.password = DEMO_USER.password;
  }
  await demoUser.save();

  console.log(`Catways importés : ${catways.length}`);
  console.log(`Réservations importées : ${reservations.length}`);
  console.log(`Compte de démo : ${demoUser.email}`);

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Erreur pendant le seed :', err);
  process.exit(1);
});
