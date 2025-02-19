const mongoose = require("mongoose");

const uri = "mongodb+srv://cvergarap:CTD2ijZK895nt9u3@actividadesdb.d3r5o.mongodb.net/?retryWrites=true&w=majority&appName=actividadesDB";

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;