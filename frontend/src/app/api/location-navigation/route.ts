import { NextResponse } from 'next/server';
import navigationData from '../../../lib/data/location_navigation.json';

export async function GET() {
  try {
    return NextResponse.json(navigationData);
  } catch (error) {
    console.error('Error in GET /api/location-navigation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location navigation data' },
      { status: 500 }
    );
  }
} 