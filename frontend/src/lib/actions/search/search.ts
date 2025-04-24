'use server';

import { Classroom, LocationData } from '../../../types';
import locationsData from '../../../lib/data/location.json';

// 検索結果の型定義
export type RouteSearchResult = {
  // 成功したかどうか
  success: boolean;
  // エラーメッセージ（もしあれば）
  error?: string;
  // 経路情報
  route?: {
    // 出発地点
    startPoint: string;
    // 目的地の教室情報
    destination: LocationData;
    // 経路ステップ（例: "1階から2階へ上がる", "右に曲がる"など）
    steps: string[];
    // 推定所要時間（分）
    estimatedTime?: number;
  };
};

/**
 * 経路検索を行うサーバーアクション
 * 
 * @param startPoint - ユーザーが入力した出発地点
 * @param roomName - 目的地の教室名
 * @returns 経路検索結果
 */
export async function findRoute(startPoint: string, roomName: string): Promise<RouteSearchResult> {
  try {
    // 入力値検証
    if (!startPoint || !roomName) {
      return {
        success: false,
        error: '出発地点と目的地を指定してください'
      };
    }

    // 目的地の教室情報を取得
    const targetLocation = (locationsData as LocationData[]).find(
      (location) => location.room_name === roomName
    );

    if (!targetLocation) {
      return {
        success: false,
        error: '指定された教室が見つかりませんでした'
      };
    }

    // TODO: 実際の経路探索アルゴリズムを実装する
    // 以下はダミーの結果を返す例
    return {
      success: true,
      route: {
        startPoint,
        destination: targetLocation,
        steps: [
          `${startPoint}から出発`,
          `${targetLocation.building_name}へ向かう`,
          `${targetLocation.building_name}に到着`,
          `エレベーターで${targetLocation.floor_number}階へ上がる`,
          `${targetLocation.room_name}に到着`
        ],
        estimatedTime: 5
      }
    };
  } catch (error) {
    console.error('経路検索エラー:', error);
    return {
      success: false,
      error: '経路検索中にエラーが発生しました'
    };
  }
}

/**
 * 後で実装する予定の実際の経路探索アルゴリズム用の設計メモ
 * 
 * 1. グラフデータ構造の準備
 *   - 各ノードは教室、階段、エレベーター、出入口などの場所を表す
 *   - エッジは場所間の接続と所要時間を表す
 * 
 * 2. ダイクストラ/A*アルゴリズムによる最短経路探索
 *   - 経路探索時には以下の要素を考慮:
 *     - 階数の移動（階段/エレベーター利用）
 *     - 混雑度（時間帯によって変動）
 *     - バリアフリールート（必要に応じて）
 *     - 建物間の移動距離
 * 
 * 3. 教室データの拡張が必要:
 *   - 各教室の正確な位置情報（座標等）
 *   - 教室間の接続関係
 *   - 階段・エレベーターの位置
 *   - 建物の出入口情報
 */
