import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { createApp } from './app.js';
import { initializeDatabase } from './config/database.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('Database initialized');

    // Create and start server
    const app = createApp();
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
