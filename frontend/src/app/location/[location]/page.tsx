'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LocationData, LocationNavigationData, LocationConnection } from '../../../types';
import { findPath } from '../../../lib/actions/findpath';
import styles from './page.module.css';

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const location = decodeURIComponent(params.location as string);
  const [classroom, setClassroom] = useState<LocationData | null>(null);
  const [navigationData, setNavigationData] = useState<LocationNavigationData | null>(null);
  const [allNavData, setAllNavData] = useState<LocationNavigationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  
  // 経路案内関連のstate
  const [routeDestination, setRouteDestination] = useState<string>('');
  const [routeDestinationName, setRouteDestinationName] = useState<string>('');
  const [route, setRoute] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [navigationComplete, setNavigationComplete] = useState<boolean>(false);

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
        setAllNavData(navData);
        
        const foundNav = navData.find((nav: LocationNavigationData) => 
          nav.location === location
        );

        if (foundNav) {
          setNavigationData(foundNav);
        }

        // セッションに目的地はあるが経路未取得の場合、新規案内を開始
        const navDest = sessionStorage.getItem('navigationDestination');
        const navDestName = sessionStorage.getItem('navigationDestinationName');
        if (navDest && !sessionStorage.getItem('navigationRoute')) {
          const path = await findPath(location, navDest);
          if (path.length === 0) {
            console.warn('新規ナビゲーションの経路が見つかりませんでした');
          } else {
            const destName = navDestName || navDest;
            setRoute(path);
            setCurrentStepIndex(0);
            setRouteDestination(navDest);
            setRouteDestinationName(destName);
            setIsNavigating(true);
            // セッションに案内情報を保存
            sessionStorage.setItem('navigationRoute', JSON.stringify(path));
            sessionStorage.setItem('navigationStepIndex', '0');
            sessionStorage.setItem('navigationDestinationName', destName);
            // 現在地が開始地点でなければ最初の地点へ遷移
            if (path[0] !== location) {
              router.push(`/location/${path[0]}`);
            }
          }
        }
        
        // 経路案内中の場合、状態を復元
        const sessionRoute = sessionStorage.getItem('navigationRoute');
        const sessionStepIndex = sessionStorage.getItem('navigationStepIndex');
        const restoreDestination = sessionStorage.getItem('navigationDestination');
        const restoreDestinationName = sessionStorage.getItem('navigationDestinationName');
        
        if (sessionRoute && sessionStepIndex && restoreDestination) {
          const parsedRoute = JSON.parse(sessionRoute);
          const parsedStepIndex = parseInt(sessionStepIndex, 10);
          
          // 現在の位置が経路上にあるか確認
          if (parsedRoute.includes(location) && parsedStepIndex < parsedRoute.length) {
            setRoute(parsedRoute);
            setCurrentStepIndex(parsedRoute.indexOf(location));
            setRouteDestination(restoreDestination);
            setRouteDestinationName(restoreDestinationName || restoreDestination);
            setIsNavigating(true);
            
            // 最終地点に到着したかチェック
            if (location === parsedRoute[parsedRoute.length - 1]) {
              setNavigationComplete(true);
            }
          }
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
  
  // 経路を検索
  const handleRouteSearch = async () => {
    if (!routeDestination || routeDestination === location) return;
    
    try {
      const path = await findPath(location, routeDestination);
      
      if (path.length === 0) {
        alert('指定された目的地への経路が見つかりませんでした。');
        return;
      }
      
      // 目的地の名前を取得
      const selectedDestination = allNavData.find(nav => nav.location === routeDestination);
      const destinationName = selectedDestination?.room_name !== "null" 
        ? selectedDestination?.room_name 
        : routeDestination;
      
      setRouteDestinationName(destinationName || routeDestination);
      setRoute(path);
      setCurrentStepIndex(0);
      setIsNavigating(true);
      setNavigationComplete(false);
      
      // セッションストレージに保存
      sessionStorage.setItem('navigationRoute', JSON.stringify(path));
      sessionStorage.setItem('navigationStepIndex', '0');
      sessionStorage.setItem('navigationDestination', routeDestination);
      sessionStorage.setItem('navigationDestinationName', destinationName || routeDestination);
      
      // 現在地が開始地点
      if (path[0] !== location) {
        // 経路の開始地点に移動
        router.push(`/location/${path[0]}`);
      }
    } catch (err) {
      console.error('経路検索エラー:', err);
      alert('経路検索中にエラーが発生しました。');
    }
  };
  
  // 次のステップに進む
  const handleNextStep = () => {
    if (currentStepIndex < route.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      
      // セッションストレージを更新
      sessionStorage.setItem('navigationStepIndex', nextIndex.toString());
      
      // 次の地点に移動
      router.push(`/location/${route[nextIndex]}`);
    } else {
      // 最終地点に到達
      setNavigationComplete(true);
    }
  };
  
  // 案内をキャンセル
  const handleCancelNavigation = () => {
    setIsNavigating(false);
    setRoute([]);
    setCurrentStepIndex(0);
    setNavigationComplete(false);
    setRouteDestination('');
    setRouteDestinationName('');
    
    // セッションストレージをクリア
    sessionStorage.removeItem('navigationRoute');
    sessionStorage.removeItem('navigationStepIndex');
    sessionStorage.removeItem('navigationDestination');
    sessionStorage.removeItem('navigationDestinationName');
  };
  
  // 次のポイントへのconnectionを取得
  const getNextLocationConnection = (): string | null => {
    if (!isNavigating || currentStepIndex >= route.length - 1 || !navigationData) {
      return null;
    }
    
    const nextLocation = route[currentStepIndex + 1];
    
    // 現在地から次の地点へのconnectionを検索
    for (const connection of navigationData.connections) {
      if (connection.target_location === nextLocation) {
        return connection.target_location;
      }
    }
    
    return null;
  };

  // ナビゲーションリンクをクリックした時の処理
  const handleNavigationClick = (targetLocation: string) => {
    router.push(`/location/${targetLocation}`);
  };
  
  // 次の目的地までの距離を計算
  const getNextStepDistance = (): number | null => {
    if (!isNavigating || currentStepIndex >= route.length - 1 || !navigationData) {
      return null;
    }
    
    const nextLocation = route[currentStepIndex + 1];
    
    // 現在地から次の地点へのconnectionを検索し、距離を取得
    for (const connection of navigationData.connections) {
      if (connection.target_location === nextLocation) {
        return connection.distance_meters;
      }
    }
    
    return null;
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
                      
                      // 経路案内中で、この接続先が次の目的地かどうか
                      const isNextInRoute = isNavigating && 
                        currentStepIndex < route.length - 1 && 
                        connection.target_location === route[currentStepIndex + 1];
                      
                      return (
                        <div
                          key={index}
                          onClick={() => handleNavigationClick(connection.target_location)}
                          className={`${styles.navigationLink} ${isNextInRoute ? styles.highlight : ''}`}
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
                            {isNextInRoute && ' [次の目的地]'}
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
              
              {/* 経路案内機能 */}
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">経路案内</h3>
                
                {isNavigating ? (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="mb-3">
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        目的地: <span className="text-blue-600">{routeDestinationName}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        進捗: {currentStepIndex + 1} / {route.length} ステップ
                      </p>
                    </div>
                    
                    {navigationComplete ? (
                      <div className="bg-green-50 dark:bg-green-900 p-3 rounded-md mb-3">
                        <p className="text-green-700 dark:text-green-300 font-semibold text-center">
                          案内終了 - 目的地に到着しました！
                        </p>
                      </div>
                    ) : (
                      <div className="mb-3">
                        {currentStepIndex < route.length - 1 && (
                          <>
                            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-md mb-2">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                次の地点: <span className="font-medium">{route[currentStepIndex + 1]}</span>
                              </p>
                              {getNextStepDistance() !== null && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  距離: {getNextStepDistance()}m
                                </p>
                              )}
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                パノラマ画像上の<span className="text-red-500 font-medium">赤く点滅している矢印</span>方向に進んでください
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {!navigationComplete && currentStepIndex < route.length - 1 && (
                        <button
                          onClick={handleNextStep}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex-1 flex items-center justify-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                          </svg>
                          次へ進む
                        </button>
                      )}
                      <button
                        onClick={handleCancelNavigation}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-medium rounded-md"
                      >
                        案内終了
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        目的地を選択
                      </label>
                      <select
                        id="destination"
                        value={routeDestination}
                        onChange={(e) => setRouteDestination(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                      >
                        <option value="">目的地を選択してください</option>
                        {allNavData
                          .filter(nav => nav.location !== location)
                          .sort((a, b) => a.location.localeCompare(b.location))
                          .map(nav => (
                            <option key={`${nav.id}-${nav.location}`} value={nav.location}>
                              {nav.location} - {nav.room_name !== "null" ? nav.room_name : "ロケーション"}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <button
                      onClick={handleRouteSearch}
                      disabled={!routeDestination}
                      className={`px-4 py-2 font-medium rounded-md ${
                        routeDestination
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      経路検索
                    </button>
                  </div>
                )}
              </div>
              
              {/* 隣接ロケーションの一覧 */}
              {navigationData && navigationData.connections.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">接続先</h3>
                  <div className="flex flex-wrap gap-2">
                    {navigationData.connections.map((connection, index) => {
                      // 経路案内中で、この接続先が次の目的地かどうか
                      const isNextInRoute = isNavigating && 
                        currentStepIndex < route.length - 1 && 
                        connection.target_location === route[currentStepIndex + 1];
                        
                      return (
                        <Link
                          key={index}
                          href={`/location/${connection.target_location}`}
                          className={`px-3 py-1 ${isNextInRoute 
                            ? 'bg-red-100 hover:bg-red-200 text-red-800 font-semibold' 
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                          } rounded-full text-sm transition flex items-center gap-1`}
                        >
                          {connection.target_location} ({connection.distance_meters}m)
                          {isNextInRoute && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                            </svg>
                          )}
                        </Link>
                      );
                    })}
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
