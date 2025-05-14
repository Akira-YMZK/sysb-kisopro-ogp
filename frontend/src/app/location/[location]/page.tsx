'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
// import { Classroom, LocationData } from '../../../types';
import { LocationData } from '../../../types';

export default function LocationDetailPage() {
  const params = useParams();
  const location = decodeURIComponent(params.location as string);
  const [classroom, setClassroom] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // ロケーションデータの取得
        const response = await fetch('/api/locations');
        if (!response.ok) {
          throw new Error('ロケーションデータの取得に失敗しました');
        }
        
        const locations = await response.json();
        
        // URLのlocationパラメータに基づいて教室を検索
        const found = locations.find((loc: LocationData) => 
          loc.location === location
        );
        
        if (found) {
          setClassroom(found);
        } else {
          setError('指定されたロケーションは見つかりませんでした');
        }
      } catch (err) {
        setError('データの読み込み中にエラーが発生しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [location]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-lg text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
          <p className="text-gray-700">{error || 'ロケーション情報が見つかりませんでした'}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/search-classrooms" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              教室検索に戻る
            </Link>
            <Link href="/" className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <Link href="/search-classrooms" className="text-blue-600 hover:underline flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          教室検索システムへ戻る
        </Link>
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-2 ml-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-house" viewBox="0 0 16 16">
            <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
          </svg>
          トップページへ戻る
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white pb-3 border-b border-gray-200 dark:border-gray-700">
            {classroom.room_name || 'ロケーション詳細'}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">基本情報</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">建物名</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{classroom.building_name || '---'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">階数</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {classroom.floor_number !== null ? `${classroom.floor_number}階` : '---'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">部屋番号</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {classroom.room_number !== null ? classroom.room_number : '---'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ロケーション識別子</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {location}
                  </p>
                </div>
                {classroom.address && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">住所</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{classroom.address}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">詳細情報</h2>
              <p className="text-gray-600 dark:text-gray-400">
                このロケーションの詳細情報はまだ登録されていません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
