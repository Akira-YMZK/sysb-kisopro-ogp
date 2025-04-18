'use server';

import { Classroom, SearchParams } from '../../types';
import { getClassrooms } from '../utils/data-utils';

/**
 * すべての教室を取得
 */
export async function getAllClassrooms(): Promise<Classroom[]> {
  return getClassrooms();
}

/**
 * 検索条件に基づいて教室をフィルタリング
 */
export async function searchClassroomsByParams(params: SearchParams): Promise<Classroom[]> {
  const { keyword, building, floor } = params;
  let classrooms = await getClassrooms();
  
  // 建物でフィルタリング
  if (building) {
    classrooms = classrooms.filter(room => 
      room.building_name === building
    );
  }
  
  // 階でフィルタリング
  if (floor) {
    const floorNum = parseInt(floor);
    classrooms = classrooms.filter(room => 
      room.floor_number === floorNum
    );
  }
  
  // キーワードでフィルタリング
  if (keyword) {
    const searchTerm = keyword.toLowerCase();
    classrooms = classrooms.filter(room => {
      const roomName = (room.room_name || '').toLowerCase();
      const buildingName = (room.building_name || '').toLowerCase();
      const roomNumber = room.room_number ? room.room_number.toString() : '';
      
      return roomName.includes(searchTerm) || 
             buildingName.includes(searchTerm) || 
             roomNumber.includes(searchTerm);
    });
  }
  
  return classrooms;
}

/**
 * 利用可能な建物リストを取得
 */
export async function getAvailableBuildings(): Promise<string[]> {
  const classrooms = await getClassrooms();
  const buildingSet = new Set<string>();
  
  classrooms.forEach(classroom => {
    if (classroom.building_name) {
      buildingSet.add(classroom.building_name);
    }
  });
  
  return Array.from(buildingSet).sort();
}

/**
 * 利用可能な階リストを取得
 */
export async function getAvailableFloors(): Promise<number[]> {
  const classrooms = await getClassrooms();
  const floorSet = new Set<number>();
  
  classrooms.forEach(classroom => {
    if (classroom.floor_number !== undefined && classroom.floor_number !== null) {
      floorSet.add(classroom.floor_number);
    }
  });
  
  return Array.from(floorSet).sort((a, b) => a - b);
}
