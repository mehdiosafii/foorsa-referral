/**
 * Periodic sync: re-check ALL leads with status "new" or "pending" against Respond.io.
 * Catches lifecycle changes that happened after initial submission.
 * Run via: node scripts/sync-new-leads.cjs
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

async function main() {
  const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  const { rows: leads } = await pool.query(`
    SELECT id, user_id, full_name, phone, whatsapp_number, status
    FROM ref_leads
    WHERE LOWER(status) IN ('new', 'pending')
      AND (phone IS NOT NULL OR whatsapp_number IS NOT NULL)
      AND deleted_at IS NULL
    ORDER BY created_at DESC
  `);

  console.log(`Found ${leads.length} leads with status new/pending to sync`);

  const stats = { found: 0, notFound: 0, updated: 0, conversions: 0, noPhone: 0, errors: 0 };

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

      if (lifecycle !== lead.status) {
        await pool.query('UPDATE ref_leads SET status = $1 WHERE id = $2', [lifecycle, lead.id]);
        stats.updated++;
        console.log(`[${i + 1}/${leads.length}] ${lead.full_name}: ${lead.status} → ${lifecycle}`);

        // Record conversion if applicable
        if (CONVERSION_LIFECYCLES.includes(lifecycle)) {
          const existing = await pool.query('SELECT 1 FROM ref_conversions WHERE lead_id = $1', [lead.id]);
          if (existing.rows.length === 0) {
            await pool.query(
              `INSERT INTO ref_conversions (id, user_id, lead_id, amount, notes, created_at)
               VALUES (gen_random_uuid()::varchar, $1, $2, 0, $3, NOW())`,
              [lead.user_id, lead.id, 'Auto-converted: lifecycle = ' + lifecycle]
            );
            stats.conversions++;
          }
        }
      }

      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      stats.errors++;
      console.error(`[${i + 1}] Error for ${lead.full_name}:`, err.message);
    }
  }

  console.log('\n=== SYNC COMPLETE ===');
  console.log(`Total: ${leads.length} | Found: ${stats.found} | Updated: ${stats.updated} | Conversions: ${stats.conversions} | Not found: ${stats.notFound} | Errors: ${stats.errors}`);

  await pool.end();
}

main().catch(console.error);
