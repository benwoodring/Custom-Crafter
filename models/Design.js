const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  designId: { type: String, required: true, unique: true },
  design: { type: String, required: true }, // Store PNG Data URL
  template: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Design', designSchema);
