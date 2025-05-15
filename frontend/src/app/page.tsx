'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import { Classroom, LocationData } from '../types';
import { LocationData } from '../types';
import { findRoute, RouteSearchResult } from '../lib/actions/search/search';

export default function Home() {
  // =========================================
  // state管理
  // =========================================

  // ロケーションデータの状態（フィルタリング済み - 目的地用）
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>([]);
  // 全てのロケーションデータ（出発地用）
  const [allLocations, setAllLocations] = useState<LocationData[]>([]);
  // 選択された出発地点のロケーション
  const [selectedStartLocation, setSelectedStartLocation] = useState('');
  // 出発地点の表示用名称
  const [selectedStartRoomName, setSelectedStartRoomName] = useState('');
  // 選択された目的地のロケーション
  const [selectedDestLocation, setSelectedDestLocation] = useState('');
  // 目的地の表示用名称
  const [selectedDestRoomName, setSelectedDestRoomName] = useState('');
  // 自由入力の出発地点（オプション）
  const [customStartPoint, setCustomStartPoint] = useState('');
  // カスタム入力を使用するかのフラグ
  const [useCustomStartPoint, setUseCustomStartPoint] = useState(false);
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
        
        // 全てのロケーションデータを保存（出発地点用）
        setAllLocations(data);
        
        // 目的地用にはroom_nameとroom_numberがnullでないデータのみ抽出
        const filtered = data.filter((loc: LocationData) => 
          loc.room_name !== null && loc.room_number !== null
        );
        setFilteredLocations(filtered);
        
        // 初期値を設定
        if (filtered.length > 0) {
          // 目的地の初期値
          setSelectedDestLocation(filtered[0].location);
          setSelectedDestRoomName(filtered[0].room_name);
        }
        
        // 出発地点の初期値（全データから）
        if (data.length > 0) {
          setSelectedStartLocation(data[0].location);
          // 表示用の名前（room_nameがnullの場合は「階数+ロケーション」を表示）
          setSelectedStartRoomName(data[0].room_name || `${data[0].floor_number}階 ${data[0].location}`);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // 出発地点ロケーション選択時の処理
  const handleStartLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const location = e.target.value;
    setSelectedStartLocation(location);
    
    // 選択されたロケーションに対応する教室名も更新
    const selectedLoc = allLocations.find(loc => loc.location === location);
    if (selectedLoc) {
      // room_nameがnullの場合は「階数+ロケーション」を表示
      setSelectedStartRoomName(
        selectedLoc.room_name || `${selectedLoc.floor_number}階 ${selectedLoc.location}`
      );
    }
  };

  // 目的地ロケーション選択時の処理
  const handleDestLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const location = e.target.value;
    setSelectedDestLocation(location);
    
    // 選択されたロケーションに対応する教室名も更新
    const selectedLoc = filteredLocations.find(loc => loc.location === location);
    if (selectedLoc) {
      setSelectedDestRoomName(selectedLoc.room_name);
    }
  };

  // 入力方法の切り替え処理
  const toggleStartPointInputMethod = () => {
    setUseCustomStartPoint(!useCustomStartPoint);
    
    // カスタム入力に切り替えた場合は入力内容をクリア
    if (!useCustomStartPoint) {
      setCustomStartPoint('');
    }
  };

  // =========================================
  // 経路検索処理
  // =========================================
  const handleRouteSearch = () => {
    // セッションに案内情報を保存
    sessionStorage.setItem('navigationDestination', selectedDestLocation);
    sessionStorage.setItem('navigationDestinationName', selectedDestRoomName);
    sessionStorage.setItem('navigationStepIndex', '0');
    // 出発地点のロケーション詳細ページへ遷移
    router.push(`/location/${encodeURIComponent(selectedStartLocation)}`);
  };

  // ロケーション表示用の関数（room_nameがnullの場合の表示を処理）
  const getLocationDisplayName = (loc: LocationData) => {
    if (loc.room_name) {
      return `${loc.room_name} (${loc.building_name} ${loc.floor_number}階)`;
    } else {
      return `${loc.building_name} ${loc.floor_number}階 ${loc.location}`;
    }
  };

  // =========================================
  // レンダリング
  // =========================================
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[80vh]">

      {/* ヘッダー画像セクション */}
      <div className="w-full relative mb-8">
        <div className="w-full h-64 md:h-80">
          <Image 
            src="/images/IMG_3273.JPG" 
            alt="3号館画像" 
            className="w-full h-full object-cover object-top rounded-lg shadow-lg"
            width={1920}
            height={400}
            priority
          />
        </div>
      </div>


      <h1 className="text-5xl font-bold text-center text-gray-800 dark:text-white mb-6">
        3Dルート検索
      </h1>
      <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
        現在地、目的地を設定すると道案内を開始します。
        3D画像上に表示される矢印に従って進んでください。
      </p>
      
      {/* 経路検索フォーム */}
      <div className="w-full max-w-md mb-8 space-y-4">
        {/* 出発地点入力切り替えボタン */}
        <div className="flex justify-end">
          <button
            onClick={toggleStartPointInputMethod}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            {useCustomStartPoint ? '教室から選択する' : '自由に入力する'}
          </button>
        </div>
        
        {/* 出発地点入力（切り替え可能） */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="startPoint" className="text-gray-700 dark:text-gray-300 font-medium">
            現在地
          </label>
          
          {/* 自由入力モード */}
          {useCustomStartPoint ? (
            <input
              id="customStartPoint"
              type="text"
              value={customStartPoint}
              onChange={(e) => setCustomStartPoint(e.target.value)}
              placeholder="現在地を入力 例:31講義室、217室"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            /* 教室選択モード */
            <select
              id="startLocation"
              value={selectedStartLocation}
              onChange={handleStartLocationChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              {loading ? (
                <option>読み込み中...</option>
              ) : (
                allLocations.map((loc) => (
                  <option key={`start-${loc.location}`} value={loc.location}>
                    {getLocationDisplayName(loc)}
                  </option>
                ))
              )}
            </select>
          )}
        </div>
        
        {/* 目的地選択 */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="destination" className="text-gray-700 dark:text-gray-300 font-medium">
            目的地
          </label>
          <select
            id="destination"
            value={selectedDestLocation}
            onChange={handleDestLocationChange}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          >
            {loading ? (
              <option>読み込み中...</option>
            ) : (
              filteredLocations.map((loc) => (
                <option key={`dest-${loc.location}`} value={loc.location}>
                  {loc.room_name} ({loc.building_name} {loc.floor_number}階)
                </option>
              ))
            )}
          </select>
        </div>
        
        {/* 経路検索ボタン */}
        <button
          onClick={handleRouteSearch}
          disabled={
            (useCustomStartPoint ? !customStartPoint.trim() : !selectedStartLocation) || 
            !selectedDestLocation || 
            loading || 
            searching
          }
          className="w-full mt-8 px-6 py-4 text-lg bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
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
        className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        教室を検索する
        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </Link>
      
      {/* フッター */}
      <footer className="w-full text-center text-gray-500 dark:text-gray-400 text-lg pb-8 mt-20">
        <p>&copy; {new Date().getFullYear()} 教室検索システム</p>
      </footer>
    </div>
  );
}
