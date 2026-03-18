const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "multi-tenant-shop",
    });

    console.log(` MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      console.warn("  MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log(" MongoDB reconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error(` MongoDB connection error: ${err.message}`);
    });

  } catch (err) {
    console.error(` MongoDB initial connection failed: ${err.message}`);
    process.exit(1); // Kill the server if DB fails to connect
  }
};

module.exports = connectDB;