const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Middleware para verificar rol de admin general - MODIFICACIÓN TEMPORAL
const isAdminGeneral = (req, res, next) => {
  // Permitir la creación de la organización inicial sin autenticación
  if (!req.user) { 
    return next(); // <-- Permite continuar sin autenticación
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'No tienes permiso para esta acción' });
  }
};

// Obtener todas las organizaciones (público)
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener una organización por ID (cualquier usuario autenticado)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear organización (solo admin general) - MODIFICACIÓN TEMPORAL
router.post(
  '/',
  /* authMiddleware,  <--- COMENTA ESTA LÍNEA TEMPORALMENTE */
  isAdminGeneral,
  [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('type').notEmpty().withMessage('El tipo es requerido'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, type } = req.body;
      const newOrganization = new Organization({ name, type });
      await newOrganization.save();
      res.status(201).json(newOrganization);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Actualizar organización (solo admin general)
router.patch(
  '/:id',
  authMiddleware,
  isAdminGeneral,
  [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('type').notEmpty().withMessage('El tipo es requerido'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, type } = req.body;
      const updatedOrganization = await Organization.findByIdAndUpdate(
        req.params.id,
        { name, type },
        { new: true }
      );
      if (!updatedOrganization) {
        return res.status(404).json({ message: 'Organización no encontrada' });
      }
      res.json(updatedOrganization);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Eliminar organización (solo admin general)
router.delete(
  '/:id',
  authMiddleware,
  isAdminGeneral,
  async (req, res) => {
    try {
      const deletedOrganization = await Organization.findByIdAndDelete(req.params.id);
      if (!deletedOrganization) {
        return res.status(404).json({ message: 'Organización no encontrada' });
      }
      res.json({ message: 'Organización eliminada' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;