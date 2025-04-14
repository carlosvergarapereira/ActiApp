const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Middleware para verificar rol de admin general o admin de organización
const isAdminOrOrgAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'orgAdmin') {
    return res.status(403).json({ message: 'No tienes permiso para esta acción' });
  }
  next();
};

// Crear actividad (cualquier usuario autenticado)
router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('El título es requerido'),
    body('category').notEmpty().withMessage('La categoría es requerida'),
    body('subcategory').notEmpty().withMessage('La subcategoría es requerida'),
    body('organization').notEmpty().withMessage('La organización es requerida'), // Asegúrate de que se envíe la organización
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, category, subcategory, organization } = req.body;
      const user = req.user._id;

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
  }
);

// Obtener actividades (cualquier usuario autenticado)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let activities;
    if (req.user.role === 'admin_general' || req.user.role === 'admin_org') {
      // Si es admin, obtiene todas las actividades de su organización
      activities = await Activity.find({ organization: req.user.organization });
    } else {
      // Si es usuario normal, obtiene solo sus actividades
      activities = await Activity.find({ user: req.user._id });
    }
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch(
  '/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const activity = await Activity.findById(req.params.id);

      if (!activity) {
        return res.status(404).json({ message: 'Actividad no encontrada' });
      }

      // Validación de permisos
      if (activity.user.toString() !== req.user._id && req.user.role !== 'orgAdmin' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No tienes permiso para actualizar esta actividad' });
      }

      // Solo actualizar los campos enviados
      const updateFields = {};
      const { title, category, subcategory, startTime, endTime } = req.body;
      if (title) updateFields.title = title;
      if (category) updateFields.category = category;
      if (subcategory) updateFields.subcategory = subcategory;
      if (startTime !== undefined) updateFields.startTime = startTime;
      if (endTime !== undefined) updateFields.endTime = endTime;

      const updatedActivity = await Activity.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true }
      );

      res.json(updatedActivity);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Eliminar actividad (solo el usuario que la creó o el admin de la organización)
router.delete(
  '/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const activity = await Activity.findById(req.params.id);

      if (!activity) {
        return res.status(404).json({ message: 'Actividad no encontrada' });
      }

      // Verifica si el usuario es el creador de la actividad o el admin de la organización
      if (activity.user.toString() !== req.user._id && req.user.role !== 'orgAdmin' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No tienes permiso para eliminar esta actividad' });
      }

      await Activity.findByIdAndDelete(req.params.id);
      res.json({ message: 'Actividad eliminada' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;