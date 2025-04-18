import fs from 'fs';
import path from 'path';
import { Classroom, Schedule } from '../../types';

/**
 * 教室データを読み込む関数
 */
export async function getClassrooms(): Promise<Classroom[]> {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/data/classrooms.json');
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading classrooms data:', error);
    return [];
  }
}

/**
 * スケジュールデータを読み込む関数
 */
export async function getSchedules(): Promise<Schedule[]> {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/data/schedules.json');
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading schedules data:', error);
    return [];
  }
}
