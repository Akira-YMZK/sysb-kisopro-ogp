import { NextResponse } from 'next/server';
// import { getSchedulesByRoomId } from '@/lib/actions/schedules';

export async function GET(
  request: Request,
  context: { params: { roomId: string } }
) {
  try {
    const { roomId } = context.params;
    // const schedules = await getSchedulesByRoomId(roomId);
    // return NextResponse.json(schedules);
    
    // 仮のレスポンスを返す（本番実装時に実際のデータに置き換える）
    return NextResponse.json([]);
  } catch (error) {
    console.error(`Error in GET /api/schedules/${context.params.roomId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch room schedules' },
      { status: 500 }
    );
  }
}
