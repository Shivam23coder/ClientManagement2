/**
 * MongoDB connection via Mongoose.
 * Centralises the connection so it can be imported without side effects elsewhere.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser and useUnifiedTopology are defaults in Mongoose 8+
    });
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1); // Crash fast — no point running without a database
  }
};

module.exports = connectDB;
