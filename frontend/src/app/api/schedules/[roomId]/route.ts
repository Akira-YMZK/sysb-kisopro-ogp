import { NextResponse } from 'next/server';
import { getSchedulesByRoomId } from '@/lib/actions/schedules';

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;
    const schedules = await getSchedulesByRoomId(roomId);
    return NextResponse.json(schedules);
  } catch (error) {
    console.error(`Error in GET /api/schedules/${params.roomId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch room schedules' },
      { status: 500 }
    );
  }
}
