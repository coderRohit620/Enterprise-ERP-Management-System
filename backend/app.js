const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Logging Middleware
app.use(morgan('dev'));

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint for MongoDB
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // Connection states map: 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  if (dbState === 1) {
    return res.status(200).json({
      status: 'OK',
      message: 'Server is healthy and connected to MongoDB.',
      database: states[dbState]
    });
  } else {
    return res.status(500).json({
      status: 'ERROR',
      message: 'Server is running but database connection is unhealthy.',
      database: states[dbState] || 'Unknown'
    });
  }
});

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Enterprise ERP Management System API' });
});

// Global 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
});

module.exports = app;
