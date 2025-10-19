import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

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

const User = mongoose.models.User || mongoose.model('User', userSchema);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, timezone = 'UTC' } = body;
    
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin already exists' },
        { status: 400 }
      );
    }

    const admin = new User({
      name,
      timezone,
      isAdmin: true
    });

    await admin.save();
    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Mock current user response
    return NextResponse.json({
      _id: 'current-user-id',
      name: 'Current User',
      timezone: 'UTC',
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
