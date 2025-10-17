const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple authentication - in a real app, you'd use proper JWT auth
// For this assignment, we'll use a simple approach

// Create admin user (for initial setup)
router.post('/setup', async (req, res) => {
  try {
    const { name, timezone = 'UTC' } = req.body;
    
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new User({
      name,
      timezone,
      isAdmin: true
    });

    await admin.save();
    res.status(201).json({ message: 'Admin created successfully', user: admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user (simplified - in real app, use JWT)
router.get('/me', async (req, res) => {
  try {
    const userId = req.headers['user-id']; // Simplified approach
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
