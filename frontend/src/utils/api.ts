/**
 * 基本的なAPI取得関数
 */
export async function fetchApi(endpoint: string, options = {}) {
  // Use relative path for API calls to leverage Next.js rewrites
  const url = `/api${endpoint}`;
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * すべての教室データを取得
 */
export async function fetchAllClassrooms() {
  return fetchApi('/classrooms');
}

/**
 * 検索条件に基づいて教室をフィルタリング
 */
export async function searchClassrooms(params: any = {}) {
  const { keyword, building, floor } = params;
  let queryParams = new URLSearchParams();
  
  if (keyword) queryParams.append('keyword', keyword);
  if (building) queryParams.append('building', building);
  if (floor) queryParams.append('floor', floor);
  
  const queryString = queryParams.toString();
  const endpoint = queryString 
    ? `/classrooms/search?${queryString}` 
    : '/classrooms';
    
  return fetchApi(endpoint);
}

/**
 * 利用可能な建物リストを取得
 */
export async function fetchBuildings() {
  return fetchApi('/buildings');
}

/**
 * 利用可能な階リストを取得
 */
export async function fetchFloors() {
  return fetchApi('/floors');
}

/**
 * 特定の教室のスケジュールを取得
 */
export async function fetchRoomSchedules(roomId: string) {
  return fetchApi(`/schedules/${roomId}`);
}
