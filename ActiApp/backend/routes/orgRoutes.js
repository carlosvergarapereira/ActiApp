const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization'); // Importa el modelo
const authMiddleware = require('../middleware/authMiddleware'); // Middleware de autenticación

// GET - Obtener todas las organizaciones
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Obtener una organización por ID
router.get('/:id', async (req, res) => {
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

// Crear organización (solo admin general)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, type } = req.body;

    // Verifica si el usuario es admin general (implementa esta lógica en authMiddleware)

    const newOrganization = new Organization({ name, type });
    await newOrganization.save();
    res.status(201).json(newOrganization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH - Actualizar una organización
router.patch('/:id', async (req, res) => {
  try {
    const updatedOrganization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedOrganization);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Eliminar una organización
router.delete('/:id', async (req, res) => {
  try {
    await Organization.findByIdAndDelete(req.params.id);
    res.json({ message: 'Organización eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;