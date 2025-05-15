import React, { useState, useEffect, useRef } from 'react';
import { SearchParams, Classroom } from '../types';
import { fetchBuildings, fetchFloors, fetchAllClassrooms } from '../utils/api';

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
  
  // オートコンプリート関連の状態
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // フェッチビルディングとフロア、および全教室データ
  useEffect(() => {
    const loadFilterOptions = async () => {
      setIsLoading(true);
      try {
        const [buildingsData, floorsData, classroomsData] = await Promise.all([
          fetchBuildings(),
          fetchFloors(),
          fetchAllClassrooms()
        ]);
        setBuildings(buildingsData);
        setFloors(floorsData);
        setAllClassrooms(classroomsData);
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterOptions();
  }, []);
  
  // クリック外のイベント監視（サジェスト閉じる）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
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
  
  // キーワード入力処理（オートコンプリート表示）
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setKeyword(input);
    
    if (input.trim().length > 0) {
      // 全角⇄半角統一＆小文字化
      const normalizedInput = input.normalize("NFKC").toLowerCase();
      
      // 候補の生成
      const suggestionSet = new Set<string>();
      
      allClassrooms.forEach(classroom => {
        // 検索対象フィールド
        const targets = [
          classroom.room_name,
          classroom.room_number ? classroom.room_number.toString() : '',
          classroom.building_name
        ];
        
        targets.forEach(target => {
          if (target && target.normalize("NFKC").toLowerCase().includes(normalizedInput)) {
            suggestionSet.add(target);
          }
        });
      });
      
      // 重複を除去して上位5件を表示
      const uniqueSuggestions = Array.from(suggestionSet).slice(0, 5);
      setSuggestions(uniqueSuggestions);
      setShowSuggestions(uniqueSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  // サジェスト選択処理
  const handleSuggestionClick = (suggestion: string) => {
    setKeyword(suggestion);
    setShowSuggestions(false);
    
    // 選択後に自動検索
    setTimeout(() => {
      onSearch({
        keyword: suggestion,
        building: selectedBuilding || undefined,
        floor: selectedFloor || undefined
      });
    }, 100);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-2 relative">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={handleKeywordChange}
              onKeyPress={handleKeyPress}
              onFocus={() => keyword.trim() && suggestions.length > 0 ? setShowSuggestions(true) : null}
              placeholder="キーワードで検索..."
              className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            
            {/* オートコンプリート候補表示 */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          
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
                  {floor}階
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
