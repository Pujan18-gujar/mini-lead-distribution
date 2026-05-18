const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Agent = require('../models/Agent');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Round Robin Lead Distribution
const assignLead = async () => {
  const agents = await Agent.find({ isActive: true });
  if (agents.length === 0) return null;
  
  const allAgents = await Agent.find({ isActive: true }).sort('currentIndex');
  const agent = allAgents[0];
  
  await Agent.findByIdAndUpdate(agent._id, { 
    $inc: { leadsAssigned: 1, currentIndex: 1 } 
  });
  
  return agent.user;
};

// Get all leads (admin)
router.get('/', auth, async (req, res) => {
  try {
    const leads = await Lead.find().populate('assignedTo', 'name email');
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my leads (agent)
router.get('/my', auth, async (req, res) => {
  try {
    const leads = await Lead.find({ assignedTo: req.user.id });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create lead + auto assign
router.post('/', auth, async (req, res) => {
  try {
    const assignedTo = await assignLead();
    const lead = await Lead.create({ ...req.body, assignedTo });
    
    // Real-time notification
    const io = req.app.get('io');
    io.emit('newLead', lead);
    
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update lead status
router.put('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;