// Vercel Serverless Function — wraps the shared Express app
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { initializeDatabase } from '../server/config/database.js';
import { createApp } from '../server/app.js';

// Ensure DB is ready on cold start (cached across warm invocations)
let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

const app = createApp();

// Add middleware to ensure DB is ready
app.use(async (_req, _res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

export default app;
