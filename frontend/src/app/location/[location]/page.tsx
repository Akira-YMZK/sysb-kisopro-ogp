'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LocationData, LocationNavigationData, LocationConnection } from '../../../types';
import styles from './page.module.css';

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const location = decodeURIComponent(params.location as string);
  const [classroom, setClassroom] = useState<LocationData | null>(null);
  const [navigationData, setNavigationData] = useState<LocationNavigationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ロケーションデータの取得
        const locResponse = await fetch('/api/locations');
        if (!locResponse.ok) {
          throw new Error('ロケーションデータの取得に失敗しました');
        }
        
        const locations = await locResponse.json();
        
        // URLのlocationパラメータに基づいて教室を検索
        const found = locations.find((loc: LocationData) => 
          loc.location === location
        );
        
        if (found) {
          setClassroom(found);
        } else {
          setError('指定されたロケーションは見つかりませんでした');
        }

        // ナビゲーションデータの取得
        const navResponse = await fetch('/api/location-navigation');
        if (!navResponse.ok) {
          throw new Error('ナビゲーションデータの取得に失敗しました');
        }

        const navData = await navResponse.json();
        const foundNav = navData.find((nav: LocationNavigationData) => 
          nav.location === location
        );

        if (foundNav) {
          setNavigationData(foundNav);
        }
      } catch (err) {
        setError('データの読み込み中にエラーが発生しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  // ナビゲーションリンクをクリックした時の処理
  const handleNavigationClick = (targetLocation: string) => {
    router.push(`/location/${targetLocation}`);
  };

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
          
          {/* パノラマ画像表示エリア */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">パノラマビュー</h2>
            <div className="w-full relative">
              <div className="overflow-x-auto pb-4 w-full" style={{ maxWidth: '100%', overflowY: 'hidden' }}>
                {!imageError ? (
                  <div className="w-max relative">
                    <img 
                      src={`/location/${location}.jpeg.jpg`}
                      alt={`${classroom.room_name || 'ロケーション'}のパノラマ画像`}
                      style={{ height: '500px', width: 'auto' }}
                      onError={() => setImageError(true)}
                    />
                    
                    {/* ナビゲーションリンク */}
                    {navigationData && navigationData.connections.map((connection, index) => {
                      // 接続地点±5%の範囲をクリック可能にする
                      const minPercent = Math.max(0, connection.position_percent - 5);
                      const maxPercent = Math.min(100, connection.position_percent + 5);
                      const width = maxPercent - minPercent;
                      
                      return (
                        <div
                          key={index}
                          onClick={() => handleNavigationClick(connection.target_location)}
                          className={styles.navigationLink}
                          style={{
                            top: '50%',
                            left: `${connection.position_percent}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className={styles.marker}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
                              <path fillRule="evenodd" d="M8 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                              <path fillRule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z"/>
                            </svg>
                          </div>
                          <div className={styles.tooltip}>
                            {connection.target_location} ({connection.distance_meters}m)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded text-center w-full" style={{ height: '500px' }}>
                    <p className="text-gray-600 dark:text-gray-400">
                      このロケーションのパノラマ画像は利用できません。
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                ← 左右にスクロールしてパノラマ画像を見る →
              </div>
              
              {/* 隣接ロケーションの一覧 */}
              {navigationData && navigationData.connections.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">接続先</h3>
                  <div className="flex flex-wrap gap-2">
                    {navigationData.connections.map((connection, index) => (
                      <Link
                        key={index}
                        href={`/location/${connection.target_location}`}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm transition"
                      >
                        {connection.target_location} ({connection.distance_meters}m)
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
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
