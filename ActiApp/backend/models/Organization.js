const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  // Otros campos que necesites para tu organización
  // Por ejemplo:
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  // ...
});

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;