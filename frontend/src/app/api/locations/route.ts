import { NextResponse } from 'next/server';
import locationsData from '../../../lib/data/location.json';

export async function GET() {
  try {
    return NextResponse.json(locationsData);
  } catch (error) {
    console.error('Error in GET /api/locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
} 