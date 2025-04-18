import { NextResponse } from 'next/server';
import { getAvailableBuildings } from '@/lib/actions/classrooms';

export async function GET() {
  try {
    const buildings = await getAvailableBuildings();
    return NextResponse.json(buildings);
  } catch (error) {
    console.error('Error in GET /api/buildings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buildings' },
      { status: 500 }
    );
  }
}
