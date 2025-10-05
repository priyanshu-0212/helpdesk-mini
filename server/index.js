// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets'); // <-- IMPORT THIS

const app = express();
// The port is read from .env, defaulting to 5000
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes); // <-- USE THIS

// Test Route
app.get('/', (req, res) => {
  res.send('HelpDesk Mini API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});