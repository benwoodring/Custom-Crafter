const mongoose = require('mongoose');

const ProcessedOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  processedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ProcessedOrder', ProcessedOrderSchema);
