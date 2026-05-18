const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isActive: { type: Boolean, default: true },
  leadsAssigned: { type: Number, default: 0 },
  currentIndex: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Agent', agentSchema);