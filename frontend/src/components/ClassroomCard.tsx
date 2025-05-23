import React from 'react';
import Link from 'next/link';
import { Classroom } from '../types';

interface ClassroomCardProps {
  classroom: Classroom;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({ classroom }) => {
  return (
    <Link href={`/classrooms/${encodeURIComponent(classroom.room_name)}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200 hover:translate-y-[-5px] cursor-pointer">
        <h3 className="text-xl font-bold mb-3 text-blue-600 dark:text-blue-400 pb-2 border-b border-gray-200 dark:border-gray-700">
          {classroom.room_name || '名称なし'}
        </h3>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">建物:</span>{' '}
            {classroom.building_name || '---'}
          </p>
          <p>
            <span className="font-semibold">階:</span>{' '}
            {classroom.floor_number !== null ? `${classroom.floor_number}階` : '---'}
          </p>
          <p>
            <span className="font-semibold">部屋番号:</span>{' '}
            {classroom.room_number !== null ? classroom.room_number : '---'}
          </p>
        </div>
        <div className="mt-4 text-right">
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
            詳細を見る →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ClassroomCard;
