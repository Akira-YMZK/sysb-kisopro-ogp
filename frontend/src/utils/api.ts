import { Classroom, Schedule, SearchParams } from '../types';
import { 
  getAllClassrooms, 
  searchClassroomsByParams, 
  getAvailableBuildings, 
  getAvailableFloors 
} from '../lib/actions/classrooms';
import { 
  getAllSchedules, 
  getSchedulesByRoomId 
} from '../lib/actions/schedules';

/**
 * すべての教室データを取得
 */
export async function fetchAllClassrooms(): Promise<Classroom[]> {
  return getAllClassrooms();
}

/**
 * 検索条件に基づいて教室をフィルタリング
 */
export async function searchClassrooms(params: SearchParams = {}): Promise<Classroom[]> {
  return searchClassroomsByParams(params);
}

/**
 * 利用可能な建物リストを取得
 */
export async function fetchBuildings(): Promise<string[]> {
  return getAvailableBuildings();
}

/**
 * 利用可能な階リストを取得
 */
export async function fetchFloors(): Promise<number[]> {
  return getAvailableFloors();
}

/**
 * すべてのスケジュールを取得
 */
export async function fetchAllSchedules(): Promise<Schedule[]> {
  return getAllSchedules();
}

/**
 * 特定の教室のスケジュールを取得
 */
export async function fetchRoomSchedules(roomId: string): Promise<Schedule[]> {
  return getSchedulesByRoomId(roomId);
}
