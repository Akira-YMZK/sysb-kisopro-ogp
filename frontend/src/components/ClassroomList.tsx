import React from 'react';
import { Classroom } from '../types';
import ClassroomCard from './ClassroomCard';

interface ClassroomListProps {
  classrooms: Classroom[];
  isLoading: boolean;
}

const ClassroomList: React.FC<ClassroomListProps> = ({ classrooms, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-pulse text-lg text-gray-500 dark:text-gray-400">
          読み込み中...
        </div>
      </div>
    );
  }

  if (classrooms.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          該当する教室が見つかりませんでした。
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classrooms.map((classroom) => (
        <ClassroomCard key={classroom.id} classroom={classroom} />
      ))}
    </div>
  );
};

export default ClassroomList;
