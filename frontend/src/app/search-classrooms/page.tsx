'use client';

import { useState, useEffect } from 'react';
import { Classroom, SearchParams } from '../../types';
import { searchClassrooms } from '../../utils/api';
import SearchForm from '../../components/SearchForm';
import ClassroomList from '../../components/ClassroomList';

export default function SearchClassrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  // 初期データ読み込み
  useEffect(() => {
    fetchClassrooms({});
  }, []);

  // 検索パラメータに基づいて教室を取得
  const fetchClassrooms = async (params: SearchParams) => {
    setIsLoading(true);
    try {
      const data = await searchClassrooms(params);
      setClassrooms(data);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 検索処理
  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    fetchClassrooms(params);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4">
          教室検索システム
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          建物、階数、キーワードで教室を検索できます
        </p>
      </header>

      <main>
        <SearchForm onSearch={handleSearch} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            検索結果 {!isLoading && <span className="text-sm font-normal text-gray-500">({classrooms.length}件)</span>}
          </h2>
          <ClassroomList classrooms={classrooms} isLoading={isLoading} />
        </div>
      </main>

      <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} 教室検索システム</p>
      </footer>
    </div>
  );
} 