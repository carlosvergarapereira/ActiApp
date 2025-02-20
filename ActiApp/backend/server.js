const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authMiddleware = require('./middleware/authMiddleware'); // Importa el middleware de autenticación

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Conexión a MongoDB
connectDB();

// Middlewares (¡ORDEN IMPORTANTE!)
app.use(cors());
app.use(express.json());

// Middleware de autenticación (¡DEBE IR PRIMERO!)
app.use(authMiddleware); // 🔒 Ahora todas las rutas requieren autenticación

// Importar rutas (DESPUÉS del middleware de autenticación)
const authRoutes = require("./routes/authRoutes");
const orgRoutes = require("./routes/orgRoutes");
const activityRoutes = require("./routes/activityRoutes");

// Rutas protegidas
app.use("/api/auth", authRoutes);
app.use("/api/organizations", orgRoutes);
app.use("/api/activities", activityRoutes);

// Iniciar servidor
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
