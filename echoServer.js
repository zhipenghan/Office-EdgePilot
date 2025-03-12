const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/completion', (req, res) => {
  const { prompt } = req.body;
  res.json({ content: `Echo: ${prompt}` });
});

app.listen(8081, () => {
  console.log('Echo server running on http://127.0.0.1:8081');
});