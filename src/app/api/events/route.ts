import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  timezone: { type: String, default: 'UTC', required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Event schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  profiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  timezone: { type: String, required: true, default: 'UTC' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userTimezone = searchParams.get('timezone') || 'UTC';

    const events = await Event.find()
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });

    // Convert timestamps to user's timezone
    const eventsWithTimezone = events.map(event => ({
      ...event.toObject(),
      startDate: dayjs(event.startDate).tz(userTimezone).toISOString(),
      endDate: dayjs(event.endDate).tz(userTimezone).toISOString(),
      createdAt: dayjs(event.createdAt).tz(userTimezone).toISOString(),
      updatedAt: dayjs(event.updatedAt).tz(userTimezone).toISOString()
    }));

    return NextResponse.json(eventsWithTimezone);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description, profiles, timezone: eventTimezone, startDate, endDate, createdBy } = body;

    if (!title || !profiles || !startDate || !endDate || !createdBy) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return NextResponse.json(
        { message: 'Profiles must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate creator exists
    const creator = await User.findById(createdBy);
    if (!creator) {
      return NextResponse.json(
        { message: 'Invalid creator ID' },
        { status: 400 }
      );
    }

    // Validate profiles exist
    const validProfiles = await User.find({ _id: { $in: profiles } });
    if (validProfiles.length !== profiles.length) {
      return NextResponse.json(
        { message: 'One or more invalid profile IDs' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (!start.isValid() || !end.isValid()) {
      return NextResponse.json(
        { message: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (end.isBefore(start)) {
      return NextResponse.json(
        { message: 'End date must be after start date' },
        { status: 400 }
      );
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

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
