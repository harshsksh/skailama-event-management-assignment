import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

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

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Test basic MongoDB connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    return NextResponse.json({ 
      message: 'MongoDB test successful',
      collections: collections.map(c => c.name),
      connectionState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB test error:', error);
    return NextResponse.json(
      { 
        error: 'MongoDB test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
