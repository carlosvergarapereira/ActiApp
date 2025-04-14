const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔹 Conectar a MongoDB
connectDB();

// 🔹 Middlewares globales
app.use(cors());
app.use(express.json());

// 🔹 Importar rutas
const authRoutes = require('./routes/authRoutes');
const orgRoutes = require('./routes/orgRoutes');
const activityRoutes = require('./routes/activityRoutes');

// 🔹 Rutas públicas
app.use('/api/auth', authRoutes);
app.use('/api/organizations', orgRoutes); // GET público
app.use('/api/activities', activityRoutes); // protegidas por middleware interno

// 🔹 Iniciar servidor
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`)
);
