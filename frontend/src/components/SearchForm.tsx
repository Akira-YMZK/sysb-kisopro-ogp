import React, { useState, useEffect } from 'react';
import { SearchParams } from '../types';
import { fetchBuildings, fetchFloors } from '../utils/api';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [buildings, setBuildings] = useState<string[]>([]);
  const [floors, setFloors] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // フェッチビルディングとフロア
  useEffect(() => {
    const loadFilterOptions = async () => {
      setIsLoading(true);
      try {
        const [buildingsData, floorsData] = await Promise.all([
          fetchBuildings(),
          fetchFloors()
        ]);
        setBuildings(buildingsData);
        setFloors(floorsData);
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      keyword: keyword.trim() || undefined,
      building: selectedBuilding || undefined,
      floor: selectedFloor || undefined
    });
  };

  // キーワード入力でエンターキー処理
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="キーワードで検索..."
            className="flex-1 p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            disabled={isLoading}
          >
            {isLoading ? '読み込み中...' : '検索'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="buildingFilter" className="whitespace-nowrap font-medium">
              建物:
            </label>
            <select
              id="buildingFilter"
              value={selectedBuilding}
              onChange={(e) => {
                setSelectedBuilding(e.target.value);
                handleSubmit(e);
              }}
              className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
            >
              <option value="">すべて</option>
              {buildings.map((building) => (
                <option key={building} value={building}>
                  {building}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="floorFilter" className="whitespace-nowrap font-medium">
              階:
            </label>
            <select
              id="floorFilter"
              value={selectedFloor}
              onChange={(e) => {
                setSelectedFloor(e.target.value);
                handleSubmit(e);
              }}
              className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
            >
              <option value="">すべて</option>
              {floors.map((floor) => (
                <option key={floor} value={floor.toString()}>
                  {floor}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
