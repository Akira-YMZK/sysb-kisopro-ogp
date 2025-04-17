const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const corsOptions = {
  origin: '*', // Allow any origin for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

const app = express();
const PORT = 5001; // Use a different port for testing

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// データファイルのパス
const classroomsFilePath = path.join(__dirname, 'data', 'classrooms.json');

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

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'API server is running' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test endpoint working' });
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

// すべての教室を取得
app.get('/api/classrooms', (req, res) => {
  const classrooms = getClassrooms();
  console.log(`Returning all classrooms: ${classrooms.length} rooms`);
  res.json(classrooms);
});

// 検索条件に基づいて教室をフィルタリング
app.get('/api/classrooms/search', (req, res) => {
  console.log('Search query:', req.query);
  const { building, floor, keyword } = req.query;
  
  // すべての教室データを取得
  let classrooms = getClassrooms();
  
  // 建物でフィルタリング
  if (building) {
    console.log(`Filtering by building: ${building}`);
    classrooms = classrooms.filter(room => room.building_name === building);
    console.log(`After building filter: ${classrooms.length} rooms`);
  }
  
  // 階でフィルタリング (floor パラメータが指定され、空でない場合のみ)
  if (floor && floor.trim() !== '') {
    const floorNum = parseInt(floor);
    console.log(`Filtering by floor: ${floorNum}, Type: ${typeof floorNum}`);
    
    classrooms = classrooms.filter(room => {
      // Ensure both values are the same type for comparison
      // Convert room.floor_number to a number if it's not already
      const roomFloor = typeof room.floor_number === 'number' ? 
                        room.floor_number : 
                        parseInt(room.floor_number);
      
      console.log(`Room: ${room.room_name}, Floor: ${roomFloor} (${typeof roomFloor}) === ${floorNum} (${typeof floorNum}): ${roomFloor === floorNum}`);
      
      return roomFloor === floorNum;
    });
    console.log(`After floor filter: ${classrooms.length} rooms`);
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

// Start server
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});
