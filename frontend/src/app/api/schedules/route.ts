import { NextResponse } from 'next/server';
import { getAllSchedules } from '@/lib/actions/schedules';

export async function GET() {
  try {
    const schedules = await getAllSchedules();
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error in GET /api/schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}
