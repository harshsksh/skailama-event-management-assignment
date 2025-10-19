import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState === 1) {
    console.log('MongoDB already connected');
    return;
  }
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
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
    console.log('Starting event creation...');
    await connectDB();
    console.log('Database connected');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { title, description, profiles, timezone: eventTimezone, startDate, endDate, createdBy } = body;

    if (!title || !profiles || !startDate || !endDate || !createdBy) {
      console.log('Missing required fields:', { title, profiles, startDate, endDate, createdBy });
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Array.isArray(profiles) || profiles.length === 0) {
      console.log('Invalid profiles array:', profiles);
      return NextResponse.json(
        { message: 'Profiles must be a non-empty array' },
        { status: 400 }
      );
    }

    console.log('Validating creator...');
    // Validate creator exists
    const creator = await User.findById(createdBy);
    if (!creator) {
      console.log('Creator not found:', createdBy);
      return NextResponse.json(
        { message: 'Invalid creator ID' },
        { status: 400 }
      );
    }
    console.log('Creator validated:', creator.name);

    console.log('Validating profiles...');
    // Validate profiles exist
    const validProfiles = await User.find({ _id: { $in: profiles } });
    if (validProfiles.length !== profiles.length) {
      console.log('Profile validation failed:', {
        requested: profiles,
        found: validProfiles.map(p => p._id)
      });
      return NextResponse.json(
        { message: 'One or more invalid profile IDs' },
        { status: 400 }
      );
    }
    console.log('Profiles validated:', validProfiles.length);

    console.log('Validating dates...');
    // Validate dates
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (!start.isValid() || !end.isValid()) {
      console.log('Invalid date format:', { startDate, endDate, startValid: start.isValid(), endValid: end.isValid() });
      return NextResponse.json(
        { message: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (end.isBefore(start)) {
      console.log('End date before start date');
      return NextResponse.json(
        { message: 'End date must be after start date' },
        { status: 400 }
      );
    }

    console.log('Converting dates to UTC...');
    // Convert dates to UTC for storage - simplified approach
    let startDateUTC, endDateUTC;
    try {
      // Simple conversion without timezone plugin
      startDateUTC = new Date(startDate);
      endDateUTC = new Date(endDate);
      console.log('Date conversion completed:', { startDateUTC, endDateUTC });
    } catch (dateError) {
      console.log('Date conversion failed:', dateError);
      throw new Error('Invalid date format');
    }

    console.log('Creating event object...');
    const event = new Event({
      title,
      description,
      profiles,
      timezone: eventTimezone,
      startDate: startDateUTC,
      endDate: endDateUTC,
      createdBy
    });

    console.log('Saving event to database...');
    await event.save();
    console.log('Event saved successfully');

    console.log('Populating event data...');
    await event.populate('profiles', 'name timezone');
    await event.populate('createdBy', 'name');
    console.log('Event populated successfully');

    console.log('Returning event:', event._id);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
