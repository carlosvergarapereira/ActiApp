const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Crear actividad
router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('El título es requerido'),
    body('category').notEmpty().withMessage('La categoría es requerida'),
    body('subcategory').notEmpty().withMessage('La subcategoría es requerida')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, category, subcategory } = req.body;
      let newActivity;

      if (req.user.role === 'admin_org') {
        // Admin org crea actividades para su organización
        newActivity = new Activity({
          title,
          category,
          subcategory,
          organization: req.user.organizationId,
          user: null
        });
      } else {
        // Usuario normal crea solo para sí mismo
        newActivity = new Activity({
          title,
          category,
          subcategory,
          user: req.user._id,
          organization: req.user.organizationId
        });
      }

      await newActivity.save();
      res.status(201).json(newActivity);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Obtener actividades
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const userId = req.user._id;

    const activities = await Activity.find({
      $or: [
        { organization: orgId, user: null }, // asignadas por org
        { user: userId } // propias
      ]
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar actividad
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    // Solo el dueño puede editar
    if (activity.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No puedes editar actividades asignadas' });
    }

    const { title, category, subcategory, startTime, endTime } = req.body;
    if (title) activity.title = title;
    if (category) activity.category = category;
    if (subcategory) activity.subcategory = subcategory;
    if (startTime !== undefined) activity.startTime = startTime;
    if (endTime !== undefined) activity.endTime = endTime;

    const updated = await activity.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Eliminar actividad
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    if (activity.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No puedes eliminar actividades asignadas' });
    }

    await activity.deleteOne();
    res.json({ message: 'Actividad eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
