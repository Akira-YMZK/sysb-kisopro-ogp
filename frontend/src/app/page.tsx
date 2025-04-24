'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Classroom, LocationData } from '../types';
import { findRoute, RouteSearchResult } from '../lib/actions/search/search';

export default function Home() {
  // =========================================
  // state管理
  // =========================================

  // ロケーションデータの状態
  const [locations, setLocations] = useState<LocationData[]>([]);
  // 選択されたロケーション
  const [selectedLocation, setSelectedLocation] = useState('');
  // 表示用の教室名
  const [selectedRoomName, setSelectedRoomName] = useState('');
  // ユーザーが入力した出発地点
  const [startPoint, setStartPoint] = useState('');
  // データ読み込み中状態
  const [loading, setLoading] = useState(true);
  // 経路検索結果の状態
  const [searchResult, setSearchResult] = useState<RouteSearchResult | null>(null);
  // 検索処理中状態
  const [searching, setSearching] = useState(false);
  
  const router = useRouter();

  // =========================================
  // ロケーションデータの取得（初期ロード時）
  // =========================================
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // APIからロケーションデータを取得
        const response = await fetch('/api/locations');
        if (!response.ok) {
          throw new Error('ロケーションデータの取得に失敗しました');
        }
        const data = await response.json();
        
        // room_nameがnullでなく、かつroom_numberもnullでないデータのみ抽出
        const filteredData = data.filter((loc: LocationData) => 
          loc.room_name !== null && loc.room_number !== null
        );
        setLocations(filteredData);
        
        // 初期値を設定
        if (filteredData.length > 0) {
          setSelectedLocation(filteredData[0].location);
          setSelectedRoomName(filteredData[0].room_name);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // ロケーション選択時の処理
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const location = e.target.value;
    setSelectedLocation(location);
    
    // 選択されたロケーションに対応する教室名も更新
    const selectedLoc = locations.find(loc => loc.location === location);
    if (selectedLoc) {
      setSelectedRoomName(selectedLoc.room_name);
    }
  };

  // =========================================
  // 経路検索処理
  // =========================================
  const handleRouteSearch = async () => {
    // 入力検証
    if (!startPoint.trim() || !selectedLocation) {
      // 入力が不完全な場合は処理を中断
      return;
    }

    try {
      // 検索開始を示す状態をセット
      setSearching(true);
      
      // Server Actionを呼び出して経路検索を実行
      const result = await findRoute(startPoint, selectedRoomName);
      
      // 検索結果を状態に保存
      setSearchResult(result);
      
      // 検索が成功した場合、ロケーション詳細ページへ遷移
      if (result.success) {
        router.push(`/location/${encodeURIComponent(selectedLocation)}`);
      }
      
    } catch (error) {
      // エラーハンドリング
      console.error('経路検索処理エラー:', error);
      setSearchResult({
        success: false,
        error: '経路検索処理中にエラーが発生しました'
      });
    } finally {
      // 検索状態を解除
      setSearching(false);
    }
  };

  // =========================================
  // レンダリング
  // =========================================
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-6">
        教室検索システム
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
        建物、階数、キーワードを使って最適な教室を見つけることができます。
        検索ページで詳細な条件を指定して、必要な教室をすぐに探し出しましょう。
      </p>
      
      {/* 経路検索フォーム */}
      <div className="w-full max-w-md mb-8 space-y-4">
        {/* 出発地点入力 */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="startPoint" className="text-gray-700 dark:text-gray-300 font-medium">
            出発地点
          </label>
          <input
            id="startPoint"
            type="text"
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            placeholder="現在地または出発点を入力"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        {/* 目的地選択 */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="destination" className="text-gray-700 dark:text-gray-300 font-medium">
            目的地
          </label>
          <select
            id="destination"
            value={selectedLocation}
            onChange={handleLocationChange}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          >
            {loading ? (
              <option>読み込み中...</option>
            ) : (
              locations.map((loc) => (
                <option key={loc.id} value={loc.location}>
                  {loc.room_name} ({loc.building_name} {loc.floor_number}階)
                </option>
              ))
            )}
          </select>
        </div>
        
        {/* 経路検索ボタン */}
        <button
          onClick={handleRouteSearch}
          disabled={!selectedLocation || !startPoint.trim() || loading || searching}
          className="w-full mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {searching ? '検索中...' : '経路検索'}
        </button>
        
        {/* エラーメッセージ表示 */}
        {searchResult && !searchResult.success && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
            {searchResult.error || 'エラーが発生しました'}
          </div>
        )}
      </div>
      
      {/* 教室検索ページへのリンク */}
      <Link 
        href="/search-classrooms" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        教室を検索する
      </Link>
       
      {/* フッター */}
      <footer className="mt-20 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} 教室検索システム</p>
      </footer>
    </div>
  );
}
