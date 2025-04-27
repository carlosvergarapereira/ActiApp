const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('El título es requerido'),
    body('category').notEmpty().withMessage('La categoría es requerida'),
    body('subcategory').notEmpty().withMessage('La subcategoría es requerida'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, category, subcategory } = req.body;
      const user = req.user._id;

      const newActivity = new Activity({
        title,
        category,
        subcategory,
        user,
        organization: req.user.organizationId, // Solo de tu sesión 🔥
      });
      await newActivity.save();
      res.status(201).json(newActivity);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userOrg = req.user.organizationId;

    if (!userOrg) {
      return res.status(400).json({ message: 'Usuario sin organización' });
    }

    const activities = await Activity.find({ organization: userOrg });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    if (!activity.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'No tienes permiso para modificar esta actividad' });
    }

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
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    if (!activity.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta actividad' });
    }

    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Actividad eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
