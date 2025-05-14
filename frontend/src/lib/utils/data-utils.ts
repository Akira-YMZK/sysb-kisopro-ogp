import fs from 'fs';
import path from 'path';
import { Classroom, Schedule } from '../../types';

async function getData(file: string): Promise<Object[]> {
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
  return getData('classrooms');
}

/**
 * スケジュールデータを読み込む関数
 */
export async function getSchedules(): Promise<Schedule[]> {
  return getData('schedules');
}

/**
 * 地点の位置関係を読み込む関数
 */
export async  function getLocationNavigation(): Promise<Object[]> {
  return getData('location_navigation');
}
