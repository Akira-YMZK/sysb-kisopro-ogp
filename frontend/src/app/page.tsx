'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Classroom } from '../types';

export default function Home() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 教室データを取得
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await fetch('/api/classrooms');
        if (!response.ok) {
          throw new Error('教室データの取得に失敗しました');
        }
        const data = await response.json();
        setClassrooms(data);
        // 初期値を設定（必要に応じて）
        if (data.length > 0) {
          setSelectedRoom(data[0].room_name);
        }
      } catch (error) {
        console.error('Error fetching classrooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  // 経路検索ボタンのハンドラー
  const handleRouteSearch = () => {
    if (selectedRoom) {
      router.push(`/classrooms/${encodeURIComponent(selectedRoom)}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-6">
        教室検索システム
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
        建物、階数、キーワードを使って最適な教室を見つけることができます。
        検索ページで詳細な条件を指定して、必要な教室をすぐに探し出しましょう。
      </p>
      
      <div className="w-full max-w-md mb-8 space-y-4">
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
        
        <div className="flex flex-col space-y-2">
          <label htmlFor="destination" className="text-gray-700 dark:text-gray-300 font-medium">
            目的地
          </label>
          <select
            id="destination"
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          >
            {loading ? (
              <option>読み込み中...</option>
            ) : (
              classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.room_name}>
                  {classroom.room_name} ({classroom.building_name} {classroom.floor_number}階)
                </option>
              ))
            )}
          </select>
        </div>
        
        <button
          onClick={handleRouteSearch}
          disabled={!selectedRoom || loading}
          className="w-full mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          経路検索
        </button>
      </div>
      
      <Link 
        href="/search-classrooms" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        教室を検索する
      </Link>
      
      <footer className="mt-20 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} 教室検索システム</p>
      </footer>
    </div>
  );
}
