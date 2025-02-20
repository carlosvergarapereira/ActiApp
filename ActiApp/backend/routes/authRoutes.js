const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Organization = require('../models/Organization');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

const SECRET_KEY = process.env.JWT_SECRET || 'secreto'; // Usar variable de entorno

// 📌 Middleware para verificar si es Admin General
const isAdminGeneral = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin_general') {
    return res.status(403).json({ message: 'No tienes permiso para esta acción' });
  }
  next();
};

// 🔹 Registro de usuario (permite primer admin sin autenticación)
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('El nombre de usuario es requerido'),
    body('firstName').notEmpty().withMessage('El primer nombre es requerido'),
    body('lastName').notEmpty().withMessage('El primer apellido es requerido'),
    body('email').isEmail().withMessage('El correo no es válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').isIn(['admin_general', 'admin_org', 'user']).withMessage('Rol inválido'),
    body('organizationId').optional().isMongoId().withMessage('ID de organización inválido'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, firstName, middleName, lastName, secondLastName, email, password, role, organizationId } = req.body;

      const existingUsers = await User.countDocuments();

      if (existingUsers > 0 && role === 'admin_general' && !req.user) {
        return res.status(403).json({ message: 'No puedes crear más administradores generales sin autenticación' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        firstName,
        middleName,
        lastName,
        secondLastName,
        email,
        password: hashedPassword,
        role,
        organizationId: organizationId || null,
      });

      await newUser.save();

      res.status(201).json({ message: 'Usuario registrado correctamente', userId: newUser._id });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// 📌 Login de usuario
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('El nombre de usuario es requerido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
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

      const payload = { id: user._id, role: user.role };
      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error del servidor' });
    }
  }
);

// 📌 Crear organización + usuario admin
router.post(
  '/create-organization',
  authMiddleware,
  isAdminGeneral,
  [
    body('name').notEmpty().withMessage('El nombre de la organización es requerido'),
    body('type').notEmpty().withMessage('El tipo de organización es requerido'),
    body('adminUsername').notEmpty().withMessage('El nombre de usuario del admin es requerido'),
    body('adminFirstName').notEmpty().withMessage('El primer nombre del admin es requerido'),
    body('adminLastName').notEmpty().withMessage('El primer apellido del admin es requerido'),
    body('adminEmail').isEmail().withMessage('El email del admin es inválido'),
    body('adminPassword').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, type, adminUsername, adminFirstName, adminMiddleName, adminLastName, adminSecondLastName, adminEmail, adminPassword } = req.body;

      let existingUser = await User.findOne({ $or: [{ username: adminUsername }, { email: adminEmail }] });
      if (existingUser) {
        return res.status(400).json({ message: 'El usuario admin ya existe' });
      }

      const newOrganization = new Organization({ name, type });
      await newOrganization.save();

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const newAdmin = new User({
        username: adminUsername,
        firstName: adminFirstName,
        middleName: adminMiddleName || '',
        lastName: adminLastName,
        secondLastName: adminSecondLastName || '',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin_org',
        organizationId: newOrganization._id,
      });

      await newAdmin.save();

      res.status(201).json({ message: 'Organización y usuario admin creados exitosamente', organization: newOrganization, admin: newAdmin });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error del servidor' });
    }
  }
);

module.exports = router;
