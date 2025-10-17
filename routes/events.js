const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const EventLog = require('../models/EventLog');
const User = require('../models/User');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// Get all events for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timezone: userTimezone } = req.query;

    const events = await Event.find({ profiles: userId })
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });

    // Convert timestamps to user's timezone
    const eventsWithTimezone = events.map(event => ({
      ...event.toObject(),
      startDate: dayjs(event.startDate).tz(userTimezone || 'UTC').toISOString(),
      endDate: dayjs(event.endDate).tz(userTimezone || 'UTC').toISOString(),
      createdAt: dayjs(event.createdAt).tz(userTimezone || 'UTC').toISOString(),
      updatedAt: dayjs(event.updatedAt).tz(userTimezone || 'UTC').toISOString()
    }));

    res.json(eventsWithTimezone);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const { timezone: userTimezone } = req.query;

    const events = await Event.find()
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });

    // Convert timestamps to user's timezone
    const eventsWithTimezone = events.map(event => ({
      ...event.toObject(),
      startDate: dayjs(event.startDate).tz(userTimezone || 'UTC').toISOString(),
      endDate: dayjs(event.endDate).tz(userTimezone || 'UTC').toISOString(),
      createdAt: dayjs(event.createdAt).tz(userTimezone || 'UTC').toISOString(),
      updatedAt: dayjs(event.updatedAt).tz(userTimezone || 'UTC').toISOString()
    }));

    res.json(eventsWithTimezone);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { title, description, profiles, timezone: eventTimezone, startDate, endDate, createdBy } = req.body;

    if (!title || !profiles || !startDate || !endDate || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate dates
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (end.isBefore(start)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Convert dates to UTC for storage
    const startDateUTC = start.tz(eventTimezone).utc().toDate();
    const endDateUTC = end.tz(eventTimezone).utc().toDate();

    const event = new Event({
      title,
      description,
      profiles,
      timezone: eventTimezone,
      startDate: startDateUTC,
      endDate: endDateUTC,
      createdBy
    });

    await event.save();
    await event.populate('profiles', 'name timezone');
    await event.populate('createdBy', 'name');

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, profiles, timezone: eventTimezone, startDate, endDate, updatedBy, userTimezone } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Store old values for logging
    const oldValues = {
      title: event.title,
      description: event.description,
      profiles: event.profiles,
      timezone: event.timezone,
      startDate: event.startDate,
      endDate: event.endDate
    };

    // Prepare update object
    const updateData = {};
    const changes = [];

    if (title !== undefined && title !== event.title) {
      updateData.title = title;
      changes.push({ field: 'title', oldValue: event.title, newValue: title });
    }

    if (description !== undefined && description !== event.description) {
      updateData.description = description;
      changes.push({ field: 'description', oldValue: event.description, newValue: description });
    }

    if (profiles !== undefined && JSON.stringify(profiles) !== JSON.stringify(event.profiles)) {
      updateData.profiles = profiles;
      changes.push({ field: 'profiles', oldValue: event.profiles, newValue: profiles });
    }

    if (eventTimezone !== undefined && eventTimezone !== event.timezone) {
      updateData.timezone = eventTimezone;
      changes.push({ field: 'timezone', oldValue: event.timezone, newValue: eventTimezone });
    }

    if (startDate !== undefined) {
      const start = dayjs(startDate);
      if (start.isValid()) {
        const startDateUTC = start.tz(eventTimezone || event.timezone).utc().toDate();
        if (startDateUTC.getTime() !== event.startDate.getTime()) {
          updateData.startDate = startDateUTC;
          changes.push({ field: 'startDate', oldValue: event.startDate, newValue: startDateUTC });
        }
      }
    }

    if (endDate !== undefined) {
      const end = dayjs(endDate);
      if (end.isValid()) {
        const endDateUTC = end.tz(eventTimezone || event.timezone).utc().toDate();
        if (endDateUTC.getTime() !== event.endDate.getTime()) {
          updateData.endDate = endDateUTC;
          changes.push({ field: 'endDate', oldValue: event.endDate, newValue: endDateUTC });
        }
      }
    }

    // Validate that end date is after start date
    if (updateData.startDate && updateData.endDate) {
      if (updateData.endDate <= updateData.startDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    } else if (updateData.startDate && event.endDate) {
      if (event.endDate <= updateData.startDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    } else if (updateData.endDate && event.startDate) {
      if (updateData.endDate <= event.startDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.json({ message: 'No changes detected', event });
    }

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate('profiles', 'name timezone').populate('createdBy', 'name');

    // Log the changes if there are any
    if (changes.length > 0 && updatedBy) {
      const eventLog = new EventLog({
        eventId: id,
        updatedBy,
        changes,
        userTimezone: userTimezone || 'UTC'
      });
      await eventLog.save();
    }

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get event logs
router.get('/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const { timezone: userTimezone } = req.query;

    const logs = await EventLog.find({ eventId: id })
      .populate('updatedBy', 'name')
      .sort({ timestamp: -1 });

    // Convert timestamps to user's timezone
    const logsWithTimezone = logs.map(log => ({
      ...log.toObject(),
      timestamp: dayjs(log.timestamp).tz(userTimezone || 'UTC').toISOString()
    }));

    res.json(logsWithTimezone);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { timezone: userTimezone } = req.query;

    const event = await Event.findById(id)
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Convert timestamps to user's timezone
    const eventWithTimezone = {
      ...event.toObject(),
      startDate: dayjs(event.startDate).tz(userTimezone || 'UTC').toISOString(),
      endDate: dayjs(event.endDate).tz(userTimezone || 'UTC').toISOString(),
      createdAt: dayjs(event.createdAt).tz(userTimezone || 'UTC').toISOString(),
      updatedAt: dayjs(event.updatedAt).tz(userTimezone || 'UTC').toISOString()
    };

    res.json(eventWithTimezone);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
