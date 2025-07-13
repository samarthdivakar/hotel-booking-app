const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // To parse JSON request bodies

// Basic CORS setup - allowing all origins for now. Refine this later for production!
const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello from Backend!');
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
}); 