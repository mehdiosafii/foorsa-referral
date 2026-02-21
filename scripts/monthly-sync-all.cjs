/**
 * Monthly full sync: re-check ALL leads against Respond.io.
 * Updates lifecycle statuses and records new conversions.
 * Also archives a monthly snapshot of lead counts per ambassador.
 * 
 * Run via: node scripts/monthly-sync-all.cjs
 */

const { Pool } = require('pg');

const DB_URL = process.env.DATABASE_URL || process.env.DATABASE_URL;
const RESPONDIO_TOKEN = process.env.RESPONDIO_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODQ1Mywic3BhY2VJZCI6MjE3MTY3LCJvcmdJZCI6MjE2MTI2LCJ0eXBlIjoiYXBpIiwiaWF0IjoxNzIyMjI3Njc3fQ.zSqvUI1BAOH5eqJDYaZpBDMbV3pCnlJX6Sfob823SoM';
const RESPONDIO_BASE = 'https://api.respond.io/v2';
const CONVERSION_LIFECYCLES = ['Our Student', 'Our Student (March)', 'New Old applicant'];

function normalizePhone(raw) {
  if (!raw) return null;
  let phone = raw.replace(/[\s\-\(\)\.]/g, '');
  if (phone.startsWith('00')) phone = '+' + phone.substring(2);
  if (phone.startsWith('+')) {
    if (phone.startsWith('+2120') && phone.length > 13) phone = '+212' + phone.substring(5);
    return phone;
  }
  if (phone.startsWith('212')) {
    if (phone.startsWith('2120') && phone.length > 12) return '+212' + phone.substring(4);
    return '+' + phone;
  }
  if (phone.startsWith('0')) return '+212' + phone.substring(1);
  if (phone.length === 9 && /^[5-7]/.test(phone)) return '+212' + phone;
  return phone;
}

async function lookupContact(phone) {
  const url = `${RESPONDIO_BASE}/contact/phone:${encodeURIComponent(phone)}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${RESPONDIO_TOKEN}`, 'Content-Type': 'application/json' },
  });
  if (res.status === 200) return await res.json();
  if (res.status === 429) {
    console.log('  Rate limited, waiting 5s...');
    await new Promise(r => setTimeout(r, 5000));
    return lookupContact(phone);
  }
  return null;
}

async function archiveMonthlySnapshot(pool, month) {
  // Create archive table if needed
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ref_monthly_snapshots (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
      month VARCHAR NOT NULL,
      user_id VARCHAR NOT NULL,
      ambassador_name VARCHAR,
      total_leads INTEGER DEFAULT 0,
      total_conversions INTEGER DEFAULT 0,
      lifecycle_breakdown JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(month, user_id)
    )
  `);

  // Get per-ambassador breakdown
  const { rows } = await pool.query(`
    SELECT 
      l.user_id,
      u.first_name || ' ' || u.last_name AS ambassador_name,
      COUNT(*) AS total_leads,
      COUNT(c.id) AS total_conversions,
      jsonb_object_agg(COALESCE(l.status, 'Unknown'), l.cnt) AS lifecycle_breakdown
    FROM (
      SELECT user_id, status, COUNT(*) AS cnt
      FROM ref_leads WHERE deleted_at IS NULL
      GROUP BY user_id, status
    ) l
    JOIN ref_users u ON u.id = l.user_id
    LEFT JOIN ref_conversions c ON c.user_id = l.user_id
    GROUP BY l.user_id, u.first_name, u.last_name
  `);

  for (const row of rows) {
    await pool.query(`
      INSERT INTO ref_monthly_snapshots (month, user_id, ambassador_name, total_leads, total_conversions, lifecycle_breakdown)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (month, user_id) DO UPDATE SET
        total_leads = $4, total_conversions = $5, lifecycle_breakdown = $6, created_at = NOW()
    `, [month, row.user_id, row.ambassador_name, row.total_leads, row.total_conversions, row.lifecycle_breakdown]);
  }

  console.log(`Archived snapshot for ${month}: ${rows.length} ambassadors`);
}

async function main() {
  const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM

  console.log(`=== MONTHLY FULL SYNC — ${month} ===\n`);

  // Step 1: Sync ALL leads against Respond.io
  const { rows: leads } = await pool.query(`
    SELECT id, user_id, full_name, phone, whatsapp_number, status
    FROM ref_leads
    WHERE (phone IS NOT NULL OR whatsapp_number IS NOT NULL)
      AND deleted_at IS NULL
    ORDER BY created_at DESC
  `);

  console.log(`Syncing ${leads.length} total leads against Respond.io...\n`);

  const stats = { total: leads.length, found: 0, notFound: 0, updated: 0, newConversions: 0, noPhone: 0, errors: 0 };

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const rawPhone = lead.whatsapp_number || lead.phone;
    const phone = normalizePhone(rawPhone);

    if (!phone || phone.length < 10) { stats.noPhone++; continue; }

    try {
      const contact = await lookupContact(phone);
      if (!contact) { stats.notFound++; continue; }

      stats.found++;
      const lifecycle = contact.lifecycle;
      if (!lifecycle || lifecycle === 'Unknown') continue;

      // Update status if changed
      if (lifecycle !== lead.status) {
        await pool.query('UPDATE ref_leads SET status = $1 WHERE id = $2', [lifecycle, lead.id]);
        stats.updated++;

        if (i < 50 || lifecycle !== lead.status) {
          console.log(`[${i + 1}/${leads.length}] ${lead.full_name}: ${lead.status} → ${lifecycle}`);
        }
      }

      // Record conversion if applicable and not already recorded
      if (CONVERSION_LIFECYCLES.includes(lifecycle)) {
        const existing = await pool.query('SELECT 1 FROM ref_conversions WHERE lead_id = $1', [lead.id]);
        if (existing.rows.length === 0) {
          await pool.query(
            `INSERT INTO ref_conversions (id, user_id, lead_id, amount, notes, created_at)
             VALUES (gen_random_uuid()::varchar, $1, $2, 0, $3, NOW())`,
            [lead.user_id, lead.id, 'Auto-converted: lifecycle = ' + lifecycle]
          );
          stats.newConversions++;
        }
      }

      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      stats.errors++;
      if (stats.errors <= 10) console.error(`[${i + 1}] Error for ${lead.full_name}:`, err.message);
    }

    // Progress log every 500
    if ((i + 1) % 500 === 0) {
      console.log(`  Progress: ${i + 1}/${leads.length} (${stats.found} found, ${stats.updated} updated)`);
    }
  }

  console.log('\n=== SYNC COMPLETE ===');
  console.log(`Total: ${stats.total} | Found: ${stats.found} | Updated: ${stats.updated} | New conversions: ${stats.newConversions} | Not found: ${stats.notFound} | Errors: ${stats.errors}`);

  // Step 2: Archive monthly snapshot
  console.log('\nArchiving monthly snapshot...');
  await archiveMonthlySnapshot(pool, month);

  // Step 3: Print summary
  const { rows: summary } = await pool.query(`
    SELECT status, COUNT(*) AS cnt FROM ref_leads WHERE deleted_at IS NULL GROUP BY status ORDER BY cnt DESC
  `);
  console.log('\nCurrent lifecycle breakdown:');
  for (const row of summary) {
    console.log(`  ${row.status}: ${row.cnt}`);
  }

  const { rows: conversionCount } = await pool.query('SELECT COUNT(*) AS cnt FROM ref_conversions');
  console.log(`\nTotal conversions: ${conversionCount[0].cnt}`);

  await pool.end();
}

main().catch(console.error);
