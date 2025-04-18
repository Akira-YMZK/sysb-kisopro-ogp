'use server';

import { Schedule } from '../../types';
import { getSchedules } from '../utils/data-utils';

/**
 * すべてのスケジュールを取得
 */
export async function getAllSchedules(): Promise<Schedule[]> {
  return getSchedules();
}

/**
 * 特定の教室のスケジュールを取得
 */
export async function getSchedulesByRoomId(roomId: string): Promise<Schedule[]> {
  const schedules = await getSchedules();
  return schedules.filter(schedule => schedule.roomId === roomId);
}
