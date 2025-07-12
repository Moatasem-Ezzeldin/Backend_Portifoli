require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ✅ CORS setup for cross-origin frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const projectRoutes = require('./routes/projects');
app.use('/projects', projectRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));