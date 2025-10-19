import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return empty array directly to match Express.js API format
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock event creation response to match Express.js API format
    const mockEvent = {
      _id: 'event-id-' + Date.now(),
      title: body.title || 'Test Event',
      description: body.description || '',
      profiles: [],
      timezone: body.timezone || 'UTC',
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || new Date().toISOString(),
      createdBy: {
        _id: 'creator-id',
        name: 'Event Creator',
        timezone: 'UTC',
        isAdmin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockEvent);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
