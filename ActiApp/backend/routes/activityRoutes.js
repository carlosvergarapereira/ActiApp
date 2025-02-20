const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const authMiddleware = require('../middleware/authMiddleware');

// Crear actividad (cualquier usuario autenticado)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, category, subcategory, organization } = req.body;
    const user = req.user._id; // Obtén el ID del usuario desde el middleware de autenticación

    const newActivity = new Activity({
      title,
      category,
      subcategory,
      user,
      organization,
    });
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener actividades (cualquier usuario autenticado)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id }); // Obtén solo las actividades del usuario
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ... (otras rutas para actualizar y eliminar actividades, si es necesario)

module.exports = router;