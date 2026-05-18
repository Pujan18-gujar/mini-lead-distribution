const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  source: { type: String },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Qualified', 'Closed'], 
    default: 'New' 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);