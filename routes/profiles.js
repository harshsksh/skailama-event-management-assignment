const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await User.find().select('-__v');
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new profile
router.post('/', async (req, res) => {
  try {
    const { name, timezone = 'UTC' } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const profile = new User({
      name,
      timezone
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile timezone
router.put('/:id/timezone', async (req, res) => {
  try {
    const { id } = req.params;
    const { timezone } = req.body;

    if (!timezone) {
      return res.status(400).json({ message: 'Timezone is required' });
    }

    const profile = await User.findByIdAndUpdate(
      id,
      { timezone, updatedAt: new Date() },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await User.findById(id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
