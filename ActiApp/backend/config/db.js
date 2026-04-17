const mongoose = require("mongoose");

const uri = "mongodb+srv://cvergarap:Company9413@actividadesdb.d3r5o.mongodb.net/";

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;