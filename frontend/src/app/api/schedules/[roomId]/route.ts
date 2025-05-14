import { NextResponse } from 'next/server';
// import { getSchedulesByRoomId } from '@/lib/actions/schedules';

// Next.jsのApp Routerの型定義に合わせて修正
interface RouteParams {
  params: {
    roomId: string;
  };
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { roomId } = params;
    // const schedules = await getSchedulesByRoomId(roomId);
    // return NextResponse.json(schedules);
    
    // 仮のレスポンスを返す（本番実装時に実際のデータに置き換える）
    return NextResponse.json([]);
  } catch (error) {
    console.error(`Error in GET /api/schedules/${params.roomId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch room schedules' },
      { status: 500 }
    );
  }
}
