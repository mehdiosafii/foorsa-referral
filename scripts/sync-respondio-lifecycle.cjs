/**
 * Sync last 700 leads with Respond.io lifecycle stages.
 * For each lead: lookup by phone in Respond.io → get lifecycle → update platform status.
 */

const { Pool } = require('pg');

const DB_URL = process.env.DATABASE_URL;
const RESPONDIO_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODQ1Mywic3BhY2VJZCI6MjE3MTY3LCJvcmdJZCI6MjE2MTI2LCJ0eXBlIjoiYXBpIiwiaWF0IjoxNzIyMjI3Njc3fQ.zSqvUI1BAOH5eqJDYaZpBDMbV3pCnlJX6Sfob823SoM';
const RESPONDIO_BASE = 'https://api.respond.io/v2';

// Use exact Respond.io lifecycle name as platform status

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
  if (res.status === 404) return null;
  // Rate limit or other error
  if (res.status === 429) {
    console.log('  Rate limited, waiting 5s...');
    await new Promise(r => setTimeout(r, 5000));
    return lookupContact(phone); // retry
  }
  return null;
}

async function main() {
  const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  // Get last 700 leads with phone numbers
  const { rows: leads } = await pool.query(`
    SELECT id, full_name, phone, whatsapp_number, status
    FROM ref_leads
    WHERE (phone IS NOT NULL OR whatsapp_number IS NOT NULL)
      AND deleted_at IS NULL
    ORDER BY created_at DESC
  `);

  console.log(`Found ${leads.length} leads to sync`);

  const stats = { found: 0, notFound: 0, updated: 0, noPhone: 0, errors: 0, unchanged: 0 };
  const lifecycleCounts = {};

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const rawPhone = lead.whatsapp_number || lead.phone;
    const phone = normalizePhone(rawPhone);

    if (!phone || phone.length < 10) {
      stats.noPhone++;
      continue;
    }

    try {
      const contact = await lookupContact(phone);

      if (!contact) {
        stats.notFound++;
        if (i % 50 === 0) console.log(`[${i}/${leads.length}] ${lead.full_name}: not found in Respond.io`);
        continue;
      }

      stats.found++;
      const lifecycle = contact.lifecycle || 'Unknown';
      lifecycleCounts[lifecycle] = (lifecycleCounts[lifecycle] || 0) + 1;

      // Use exact lifecycle name as status
      if (lifecycle && lifecycle !== 'Unknown' && lifecycle !== lead.status) {
        await pool.query('UPDATE ref_leads SET status = $1 WHERE id = $2', [lifecycle, lead.id]);
        stats.updated++;
        console.log(`[${i}/${leads.length}] ${lead.full_name}: ${lead.status} → ${lifecycle}`);
      } else {
        stats.unchanged++;
      }

      // Small delay to avoid rate limiting (100ms between requests)
      await new Promise(r => setTimeout(r, 100));

    } catch (err) {
      stats.errors++;
      console.error(`[${i}] Error for ${lead.full_name}:`, err.message);
    }

    // Progress every 100
    if ((i + 1) % 100 === 0) {
      console.log(`\n--- Progress: ${i + 1}/${leads.length} ---`);
      console.log(`Found: ${stats.found}, Not found: ${stats.notFound}, Updated: ${stats.updated}, Unchanged: ${stats.unchanged}, Errors: ${stats.errors}`);
      console.log();
    }
  }

  console.log('\n=== SYNC COMPLETE ===');
  console.log(`Total processed: ${leads.length}`);
  console.log(`Found in Respond.io: ${stats.found}`);
  console.log(`Not found: ${stats.notFound}`);
  console.log(`Updated: ${stats.updated}`);
  console.log(`Unchanged: ${stats.unchanged}`);
  console.log(`No valid phone: ${stats.noPhone}`);
  console.log(`Errors: ${stats.errors}`);
  console.log('\nLifecycle distribution:', JSON.stringify(lifecycleCounts, null, 2));

  await pool.end();
}

main().catch(console.error);
