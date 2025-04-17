const express = require('express');
const cors = require('cors');
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

// Simple buildings endpoint
app.get('/api/buildings', (req, res) => {
  res.json(["工学部3号館"]);
});

// Simple floors endpoint
app.get('/api/floors', (req, res) => {
  res.json([1, 2, 3, 4]);
});

// Simple classrooms endpoint
app.get('/api/classrooms', (req, res) => {
  res.json([{ id: "test", building_name: "工学部3号館", floor_number: 2, room_number: 101, room_name: "Test Room" }]);
});

// Classrooms search endpoint with filtering
app.get('/api/classrooms/search', (req, res) => {
  console.log('Search query:', req.query);
  const { building, floor } = req.query;
  
  // Start with all classrooms
  let classrooms = [
    { id: "room1", building_name: "工学部3号館", floor_number: 2, room_number: 217, room_name: "演習室3" },
    { id: "room2", building_name: "工学部3号館", floor_number: 2, room_number: 221, room_name: "31号講義室" },
    { id: "room3", building_name: "工学部3号館", floor_number: 3, room_number: 309, room_name: "演習室4" },
    { id: "room4", building_name: "工学部3号館", floor_number: 3, room_number: 317, room_name: "演習室5" },
    { id: "room5", building_name: "工学部3号館", floor_number: 4, room_number: 411, room_name: "演習室6" }
  ];
  
  // Apply filters
  if (building) {
    classrooms = classrooms.filter(room => room.building_name === building);
  }
  
  if (floor) {
    const floorNum = parseInt(floor);
    classrooms = classrooms.filter(room => room.floor_number === floorNum);
  }
  
  res.json(classrooms);
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});
