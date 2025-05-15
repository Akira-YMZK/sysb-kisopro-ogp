import fs from 'fs';
import path from 'path';
import { Classroom, Schedule, LocationNavigationData } from '../../types';

async function getData<T>(file: string): Promise<T[]> {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/data/'+file+'.json');
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', file, error);
    return [];
  }
}

/**
 * 教室データを読み込む関数
 */
export async function getClassrooms(): Promise<Classroom[]> {
  return getData<Classroom>('classrooms');
}

/**
 * スケジュールデータを読み込む関数
 */
export async function getSchedules(): Promise<Schedule[]> {
  return getData<Schedule>('schedules');
}

/**
 * 地点の位置関係を読み込む関数
 */
export async function getLocationNavigation(): Promise<LocationNavigationData[]> {
  return getData<LocationNavigationData>('location_navigation');
}
