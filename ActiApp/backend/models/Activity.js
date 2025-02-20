const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String },
  subcategory: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  startTime: { type: Date },
  endTime: { type: Date },
});

module.exports = mongoose.model('Activity', activitySchema);