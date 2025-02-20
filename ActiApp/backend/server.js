const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');


// Importar rutas
const authRoutes = require("./routes/authRoutes");
const orgRoutes = require("./routes/orgRoutes");
const activityRoutes = require("./routes/activityRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
connectDB();

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);
//app.use("/api/activity", activityRoutes);

// Iniciar servidor
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));