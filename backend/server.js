require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Test the connection before starting server
async function startServer() {
  try {
    // Attempt connecting to MongoDB
    await connectDB();

    // Start HTTP Server
    app.listen(PORT, () => {
      console.log(`ERP Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Fatal Database Connection Error. Server startup halted.');
    console.error(error.message);
    
    // Still start server in degraded state if DB is missing (useful for initial docker/dev builds)
    console.log('Starting server in DEGRADED mode (Database unreachable)...');
    app.listen(PORT, () => {
      console.log(`ERP Server is running (Degraded) on port ${PORT}`);
    });
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});

startServer();
