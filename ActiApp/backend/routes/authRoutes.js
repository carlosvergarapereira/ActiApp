const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator'); // Importa express-validator

// Registro de usuario
router.post(
  '/register',
  [
    // Validación de datos con express-validator
    body('username', 'El nombre de usuario es requerido').notEmpty(),
    body('email', 'El email es requerido').isEmail().withMessage('Email inválido'),
    body('password', 'La contraseña es requerida').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role', 'El rol es requerido').notEmpty(), // Asegúrate de validar el rol
    body('organization', 'La organización es requerida').notEmpty(), // Asegúrate de validar la organización
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role, organization } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'El usuario ya existe' });
      }

      user = new User({
        username,
        email,
        password,
        role,
        organization,
      });

      // Hash de la contraseña (usando async/await)
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();
      res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
      console.error(error); // Imprime el error completo para debuggear
      res.status(500).json({ message: 'Error del servidor' }); // Envía un mensaje genérico al cliente
    }
  }
);

// Inicio de sesión
router.post(
  '/login',
  [
    // Validación de datos con express-validator
    body('username', 'El nombre de usuario es requerido').notEmpty(),
    body('password', 'La contraseña es requerida').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Crea un token JWT (usando async/await)
      const payload = { id: user._id }; // Payload con el ID del usuario
      const token = await jwt.sign(payload, 'secreto', { expiresIn: '1h' }); // Reemplaza 'secreto' con una clave secreta real y robusta

      res.json({ token });
    } catch (error) {
      console.error(error); // Imprime el error completo para debuggear
      res.status(500).json({ message: 'Error del servidor' }); // Envía un mensaje genérico al cliente
    }
  }
);

module.exports = router;