const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
connectDB();

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/org', require('./routes/orgRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));

// Iniciar servidor
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));