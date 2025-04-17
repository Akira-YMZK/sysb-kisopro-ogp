const express = require('express');
const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// リクエストをログに記録
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// データファイルのパス
const classroomsFilePath = path.join(__dirname, 'data', 'classrooms.json');
const schedulesFilePath = path.join(__dirname, 'data', 'schedules.json');

// 教室データを読み込む関数
const getClassrooms = () => {
  try {
    const data = fs.readFileSync(classroomsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading classrooms data:', error);
    return [];
  }
};

// スケジュールデータを読み込む関数
const getSchedules = () => {
  try {
    const data = fs.readFileSync(schedulesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading schedules data:', error);
    return [];
  }
};

// すべての教室を取得
app.get('/api/classrooms', (req, res) => {
  const classrooms = getClassrooms();
  res.json(classrooms);
});

// 検索条件に基づいて教室をフィルタリング
app.get('/api/classrooms/search', (req, res) => {
  const { building, floor, keyword } = req.query;
  let classrooms = getClassrooms();
  
  // 建物でフィルタリング
  if (building) {
    classrooms = classrooms.filter(room => 
      room.building_name === building
    );
  }
  
  // 階でフィルタリング
  if (floor) {
    const floorNum = parseInt(floor);
    classrooms = classrooms.filter(room => 
      room.floor_number === floorNum
    );
  }
  
  // キーワードでフィルタリング
  if (keyword) {
    const searchTerm = keyword.toLowerCase();
    classrooms = classrooms.filter(room => {
      const roomName = (room.room_name || '').toLowerCase();
      const buildingName = (room.building_name || '').toLowerCase();
      const roomNumber = room.room_number ? room.room_number.toString() : '';
      
      return roomName.includes(searchTerm) || 
             buildingName.includes(searchTerm) || 
             roomNumber.includes(searchTerm);
    });
  }
  
  res.json(classrooms);
});

// すべてのスケジュールを取得
app.get('/api/schedules', (req, res) => {
  const schedules = getSchedules();
  res.json(schedules);
});

// 特定の教室のスケジュールを取得
app.get('/api/schedules/:roomId', (req, res) => {
  const { roomId } = req.params;
  const schedules = getSchedules();
  
  const roomSchedules = schedules.filter(schedule => 
    schedule.roomId === roomId
  );
  
  res.json(roomSchedules);
});

// 利用可能な建物リストを取得
app.get('/api/buildings', (req, res) => {
  const classrooms = getClassrooms();
  const buildingSet = new Set();
  
  classrooms.forEach(classroom => {
    if (classroom.building_name) {
      buildingSet.add(classroom.building_name);
    }
  });
  
  const buildings = Array.from(buildingSet).sort();
  res.json(buildings);
});

// 利用可能な階リストを取得
app.get('/api/floors', (req, res) => {
  const classrooms = getClassrooms();
  const floorSet = new Set();
  
  classrooms.forEach(classroom => {
    if (classroom.floor_number !== undefined && classroom.floor_number !== null) {
      floorSet.add(classroom.floor_number);
    }
  });
  
  const floors = Array.from(floorSet).sort((a, b) => a - b);
  res.json(floors);
});

// テスト用のエンドポイント
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
