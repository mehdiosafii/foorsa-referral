import pg from 'pg';
import { readFileSync } from 'fs';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'process.env.DATABASE_URL',
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  try {
    const sql = readFileSync('./migrate.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
