const express = require('express');
const app = express();
const port = 3000;

// Load environment variables from .env file (if running locally)
require('dotenv').config();

const mongoose = require('mongoose');

// Basic CORS setup - allowing all origins for now. Refine this later for production!
const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello from Backend!');
});

const DB_USER = process.env.MONGO_INITDB_ROOT_USERNAME || 'user';
const DB_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || 'password';
const DB_HOST = 'mongodb'; // This is the service name from docker-compose.yml
const DB_PORT = 27017;
const DB_NAME = 'hotelbooking'; // You can choose your database name

const mongoUri = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected successfully!');
    app.listen(port, () => {
      console.log(`Backend listening at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  }); 