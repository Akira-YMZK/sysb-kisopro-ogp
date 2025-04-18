import { NextResponse } from 'next/server';
import { getAllClassrooms } from '@/lib/actions/classrooms';

export async function GET() {
  try {
    const classrooms = await getAllClassrooms();
    return NextResponse.json(classrooms);
  } catch (error) {
    console.error('Error in GET /api/classrooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classrooms' },
      { status: 500 }
    );
  }
}
