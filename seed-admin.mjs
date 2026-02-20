import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'process.env.DATABASE_URL',
  ssl: { rejectUnauthorized: false },
});

async function seedAdmin() {
  try {
    // Check if admin exists
    const existing = await pool.query(
      'SELECT id FROM ref_users WHERE email = $1',
      ['admin@foorsa.ma']
    );

    if (existing.rows.length > 0) {
      console.log('⚠️  Admin user already exists');
      return;
    }

    // Create admin with hashed password
    const hashedPassword = await bcrypt.hash('FoorsaRef2026!', 10);
    
    await pool.query(
      `INSERT INTO ref_users 
      (first_name, last_name, email, password, referral_code, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Admin', 'Foorsa', 'admin@foorsa.ma', hashedPassword, 'admin-foorsa', true]
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@foorsa.ma');
    console.log('   Password: FoorsaRef2026!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await pool.end();
  }
}

seedAdmin();
