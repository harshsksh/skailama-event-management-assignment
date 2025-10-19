import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock admin setup response to match Express.js API format
    const mockAdmin = {
      _id: 'admin-id-' + Date.now(),
      name: body.name || 'Admin User',
      timezone: body.timezone || 'UTC',
      isAdmin: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockAdmin);
  } catch (error) {
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
