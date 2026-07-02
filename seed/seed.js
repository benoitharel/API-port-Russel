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

  await Catway.deleteMany({});
  const catways = await Catway.insertMany(require('./catways.json'));

  await Reservation.deleteMany({});
  const reservations = await Reservation.insertMany(require('./reservations.json'));

  let demoUser = await User.findOne({ email: DEMO_USER.email });
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
