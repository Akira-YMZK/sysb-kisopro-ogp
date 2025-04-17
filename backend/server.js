const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルート
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});