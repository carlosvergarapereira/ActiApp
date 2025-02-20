const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // Ej: "Pública", "Privada"
});

module.exports = mongoose.model('Organization', organizationSchema);