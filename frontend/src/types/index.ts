// 教室データの型
export interface Classroom {
  id: string;
  building_name: string;
  floor_number: number;
  room_number: number | null;
  room_name: string;
  address?: string;
}

// スケジュールデータの型
export interface Schedule {
  id: string;
  class: string;
  day: string;
  time: string;
  roomId: string;
}

// 検索条件の型
export interface SearchParams {
  keyword?: string;
  building?: string;
  floor?: string;
}

// ロケーションデータの型
export interface LocationData extends Classroom {
  location: string;
}

// ロケーションナビゲーション接続の型
export interface LocationConnection {
  target_location: string;
  position_percent: number;
  distance_meters: number;
  direction_name?: string;
}

// ロケーションナビゲーションデータの型
export interface LocationNavigationData {
  id: string;
  location: string;
  room_name: string;
  floor_number: number;
  panorama_image: string;
  connections: LocationConnection[];
}
