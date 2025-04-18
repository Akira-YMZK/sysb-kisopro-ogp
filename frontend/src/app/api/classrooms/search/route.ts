import { NextResponse } from 'next/server';
import { searchClassroomsByParams } from '@/lib/actions/classrooms';
import { SearchParams } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params: SearchParams = {
      keyword: searchParams.get('keyword') || undefined,
      building: searchParams.get('building') || undefined,
      floor: searchParams.get('floor') || undefined
    };

    const classrooms = await searchClassroomsByParams(params);
    return NextResponse.json(classrooms);
  } catch (error) {
    console.error('Error in GET /api/classrooms/search:', error);
    return NextResponse.json(
      { error: 'Failed to search classrooms' },
      { status: 500 }
    );
  }
}
