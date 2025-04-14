const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const {
      username,
      firstName,
      middleName,
      lastName,
      secondLastName,
      email,
      password,
      role,
      organizationId
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      firstName,
      middleName,
      lastName,
      secondLastName,
      email,
      password: hashedPassword,
      role,
      organizationId
    });

    await user.save();

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("👤 Usuario devuelto:", user);
    console.log("💡 Usuario encontrado en login:", user);
    res.status(200).json({
      token,
      user: user.toObject()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};