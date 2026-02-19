# Foorsa Referral Engine

A referral/ambassador marketing platform for "Foorsa - Study in China". Ambassadors share tracking links, get leads, earn points on a leaderboard.

## Features

- 🎯 **Landing Page** - Bilingual (French/English) with lead capture form
- 📊 **Ambassador Dashboard** - Track clicks, leads, conversions, and points
- 👑 **Admin Panel** - Full CRUD for ambassadors and leads
- 📈 **Analytics** - Real-time charts and statistics
- 💬 **WhatsApp Integration** - Quick-send to leads
- 🗺️ **Tracking** - Monitor referral link performance
- 🏆 **Leaderboard** - Public ranking by points

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express, TypeScript
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Vercel Serverless
- **Analytics**: Google Analytics, Facebook Pixel

## Project Structure

```
foorsa-referral/
├── src/                    # React frontend
│   ├── pages/              # Page components
│   ├── App.tsx             # Main app with routing
│   └── main.tsx            # Entry point
├── server/                 # Express backend
│   ├── routes/             # API route handlers
│   ├── middleware/         # Auth middleware
│   ├── config/             # Database config
│   └── utils/              # Helper functions
├── api/                    # Vercel serverless wrapper
│   └── index.ts
└── vercel.json             # Vercel deployment config
```

## Database Schema

All tables use `ref_` prefix to avoid conflicts:

- `ref_ambassadors` - Ambassador accounts with referral codes
- `ref_leads` - Captured leads from landing page
- `ref_clicks` - Click tracking data
- `ref_tracking_links` - Tracking link performance

## Setup

1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and fill in values
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

Set environment variables in Vercel dashboard:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `ADMIN_PASSWORD`

## API Routes

### Public
- `GET /api/leaderboard` - Public leaderboard
- `POST /api/leads` - Submit new lead
- `GET /ref/:code` - Tracking redirect

### Ambassador (requires auth)
- `POST /api/ambassador/login` - Login
- `GET /api/ambassador/me` - Get profile
- `GET /api/stats` - Get personal stats
- `GET /api/leads/recent` - Recent leads

### Admin (requires auth)
- `POST /api/login` - Admin login
- `GET /api/admin/stats` - System stats
- `GET /api/admin/users` - List ambassadors
- `POST /api/admin/users` - Create ambassador
- `GET /api/admin/leads` - List all leads
- `POST /api/admin/leads/quick-send` - WhatsApp quick send
- `POST /api/admin/leads/bulk-send` - WhatsApp bulk send

## Default Credentials

- **Admin Password**: Set in `.env.local` as `ADMIN_PASSWORD`
- **Test Ambassadors**: Use `/api/admin/seed-ambassadors` to create test accounts

## License

Proprietary - Foorsa © 2026
