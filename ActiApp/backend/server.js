const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔹 Conectar a MongoDB
connectDB();

// 🔹 Middlewares
app.use(cors());
app.use(express.json());

// 🔹 Importar rutas
const authRoutes = require("./routes/authRoutes");
const orgRoutes = require("./routes/orgRoutes");
const activityRoutes = require("./routes/activityRoutes");

// 🔹 Rutas públicas
app.use("/api/auth", authRoutes);

// 🔒 Middleware de autenticación (después de authRoutes)
app.use(authMiddleware);

// 🔒 Rutas protegidas
app.use("/api/organizations", orgRoutes);
app.use("/api/activities", activityRoutes);

// 🔹 Iniciar servidor
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
