const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true }, // Primer nombre
  middleName: { type: String, required: false }, // Segundo nombre (opcional)
  lastName: { type: String, required: true }, // Primer apellido
  secondLastName: { type: String, required: false }, // Segundo apellido (opcional)
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin_general', 'admin_org', 'user'], required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
});

module.exports = mongoose.model('User', UserSchema);
