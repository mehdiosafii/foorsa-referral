# Foorsa Referral Engine

Rebuilt from the original Replit app for Vercel + Supabase deployment.

## Architecture

- **Frontend**: React + Vite (client/)
- **Backend**: Vercel Serverless Functions (api/)
- **Database**: Supabase PostgreSQL (shared with Foorsa Reward)
- **Deployment**: Vercel

## Database Tables

All tables prefixed with `ref_` to avoid conflicts:

- `ref_users` - Ambassadors
- `ref_clicks` - Click tracking
- `ref_leads` - Lead submissions
- `ref_conversions` - Successful sales
- `ref_tracking_links` - Admin tracking links
- `ref_tracking_clicks` - Tracking link clicks
- `ref_tracking_leads` - Tracking link leads
- `ref_whatsapp_sequences` - Automated WhatsApp sequences
- `ref_whatsapp_sequence_steps` - Sequence steps
- `ref_whatsapp_sequence_assignments` - Lead sequence assignments
- `ref_whatsapp_messages` - WhatsApp message queue
- `ref_api_keys` - API keys for integrations
- `ref_webhooks` - Webhook configurations
- `ref_lead_exports` - Export tracking
- `ref_respondio_contacts` - Respond.io contacts
- `ref_respondio_webhook_log` - Webhook logs

## Environment Variables

Set in Vercel:
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_PASSWORD` - Admin login password (default: FoorsaRef2026!)

## Development

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run build
npx vercel --prod
```

## Admin Access

- URL: `/admin`
- Password: `FoorsaRef2026!`

## Ambassador Login

- URL: `/login`
- Credentials: Email + Password (created by admin)

## API Routes

### Public
- `POST /api/track/:code` - Track click
- `POST /api/track/:code/lead` - Submit lead
- `GET /api/ambassadors/public` - List ambassadors

### Ambassador (authenticated)
- `GET /api/stats?userId=:id` - Get stats
- `GET /api/leads?userId=:id` - Get leads
- `GET /api/leaderboard` - Get leaderboard

### Admin (authenticated)
- `GET /api/admin/stats` - Admin dashboard stats
- `GET /api/admin/users` - List ambassadors
- `POST /api/admin/users` - Create ambassador
- `GET /api/admin/leads` - List all leads
