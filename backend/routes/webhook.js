const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Agent = require('../models/Agent');

// Store processed webhook IDs (idempotency)
const processedWebhooks = new Set();

// Round Robin assign
const assignLead = async () => {
  const agents = await Agent.find({ isActive: true }).sort('leadsAssigned');
  if (agents.length === 0) return null;
  const agent = agents[0];
  await Agent.findByIdAndUpdate(agent._id, { $inc: { leadsAssigned: 1 } });
  return agent.user;
};

// Webhook endpoint
router.post('/', async (req, res) => {
  try {
    const { webhookId, name, email, phone, source } = req.body;

    // Idempotency check
    if (webhookId && processedWebhooks.has(webhookId)) {
      return res.status(200).json({ message: 'Webhook already processed' });
    }

    if (webhookId) processedWebhooks.add(webhookId);

    const assignedTo = await assignLead();
    const lead = await Lead.create({ name, email, phone, source, assignedTo });

    // Real-time notification
    const io = req.app.get('io');
    if (io) io.emit('newLead', lead);

    res.status(201).json({ message: 'Lead created via webhook', lead });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;