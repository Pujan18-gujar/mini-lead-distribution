const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all agents
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find().populate('user', 'name email');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add agent
router.post('/', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const existing = await Agent.findOne({ user: userId });
    if (existing) return res.status(400).json({ message: 'Agent already exists' });
    
    const agent = await Agent.create({ user: userId });
    res.status(201).json(agent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle agent active status
router.put('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete agent
router.delete('/:id', auth, async (req, res) => {
  try {
    await Agent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Agent deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;