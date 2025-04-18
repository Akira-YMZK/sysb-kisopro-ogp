import { NextResponse } from 'next/server';
import { getAvailableFloors } from '@/lib/actions/classrooms';

export async function GET() {
  try {
    const floors = await getAvailableFloors();
    return NextResponse.json(floors);
  } catch (error) {
    console.error('Error in GET /api/floors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch floors' },
      { status: 500 }
    );
  }
}
