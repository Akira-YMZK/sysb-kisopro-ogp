import navigationJson from '../data/location_navigation.json';
import { LocationNavigationData } from '../../types';

/**
 * 指定された開始地点から目標地点までの最短経路を配列で返す
 * @param startId 開始地点のID
 * @param goalId 目標地点のID
 * @returns スタートからゴールまでの順序で並んだロケーションID配列。
 *          経路が見つからない場合は空配列を返す。
 */
export async function findPath(startId: string, goalId: string): Promise<string[]> {
  // 開始とゴールが同じならその地点のみを返す
  if (startId === goalId) {
    return [startId];
  }

  // JSONから読み込んだナビゲーションデータ
  const locationNavigationData = navigationJson as LocationNavigationData[];
  const navigationMap = new Map<string, LocationNavigationData>(
    locationNavigationData.map(item => [item.location, item])
  );

  // Dijkstraアルゴリズムの初期化
  const costs = new Map<string, number>();
  const previous = new Map<string, string>();
  const unvisited = new Set<string>();

  // すべてのノードを未訪問にセットし、コストを∞に
  locationNavigationData.forEach(item => {
    costs.set(item.location, Infinity);
    unvisited.add(item.location);
  });
  // 開始地点コストは0
  costs.set(startId, 0);

  // 未訪問ノードがある限りループ
  while (unvisited.size > 0) {
    // 最小コストのノードを選択
    let currentId: string | null = null;
    let minCost = Infinity;
    for (const nodeId of unvisited) {
      const c = costs.get(nodeId) ?? Infinity;
      if (c < minCost) {
        minCost = c;
        currentId = nodeId;
      }
    }
    // 到達不可能またはゴールに到達した場合は終了
    if (currentId === null || minCost === Infinity || currentId === goalId) {
      break;
    }

    // 現ノードを訪問済みに
    unvisited.delete(currentId);

    const currentNav = navigationMap.get(currentId);
    if (!currentNav) continue;

    // 隣接ノードを検査
    for (const conn of currentNav.connections) {
      const nextId = conn.target_location;
      if (!unvisited.has(nextId)) continue;
      const newCost = (costs.get(currentId) ?? 0) + conn.distance_meters;
      if (newCost < (costs.get(nextId) ?? Infinity)) {
        costs.set(nextId, newCost);
        previous.set(nextId, currentId);
      }
    }
  }

  // 経路を再構築
  const path: string[] = [];
  if (!previous.has(goalId)) {
    // 経路が見つからない場合
    return [];
  }
  let step = goalId;
  while (true) {
    path.unshift(step);
    const prev = previous.get(step);
    if (!prev) break;
    step = prev;
    if (step === startId) {
      path.unshift(startId);
      break;
    }
  }

  return path;
}
