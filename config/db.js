const mongoose = require('mongoose');

/**
 * Connexion Mongoose avec cache global, pour survivre entre invocations
 * serverless (Vercel) sans rouvrir une connexion à chaque requête.
 */
let cached = (global.mongooseConn ??= { conn: null, promise: null });

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  console.log('MongoDB connecté');
  return cached.conn;
}

module.exports = connectDB;
