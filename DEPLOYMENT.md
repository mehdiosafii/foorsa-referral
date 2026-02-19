# Deployment Guide - Foorsa Referral Engine

## Prerequisites

1. **Supabase Project** - Already configured (cetxjzzoswrcykhcxwai)
2. **Vercel Account** - Sign up at vercel.com
3. **GitHub Account** - Repository created

## Step 1: Database Setup

1. Go to your Supabase project: https://supabase.com/dashboard/project/cetxjzzoswrcykhcxwai
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-init.sql`
4. Click "Run" to create all tables and indexes

## Step 2: Environment Variables

Create these environment variables in your Vercel project:

```
SUPABASE_URL=https://cetxjzzoswrcykhcxwai.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldHhqenpvc3dyY3lraGN4d2FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMzODI1NiwiZXhwIjoyMDg1OTE0MjU2fQ.BCr4oLN24c82N9cWq8cwIOg9qI7GnVnRLMFJeZLYFB0
JWT_SECRET=foorsa-referral-jwt-secret-prod-2026
ADMIN_PASSWORD=YourSecurePasswordHere
NODE_ENV=production
```

⚠️ **Important**: Change `ADMIN_PASSWORD` and `JWT_SECRET` to secure values for production!

## Step 3: Deploy to Vercel

### Option A: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option B: Via GitHub Integration

1. Push code to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/foorsa-referral.git
   git push -u origin master
   ```

2. Go to vercel.com/new
3. Import your GitHub repository
4. Configure environment variables
5. Click "Deploy"

## Step 4: Create Admin Account

After deployment, you can:

1. Login at `/login` with the admin password you set
2. Navigate to `/admin/ambassadors`
3. Click "Add Ambassador" to create ambassador accounts
4. Or use the "Seed" button in Settings to create test accounts

## Step 5: Test the System

1. **Landing Page**: Visit your domain (e.g., `https://foorsa-referral.vercel.app`)
2. **Ambassador Login**: Go to `/login` and test ambassador login
3. **Admin Panel**: Go to `/admin` and login with admin password
4. **Tracking**: Test a referral link: `/ref/YOURCODE`

## Step 6: Custom Domain (Optional)

1. In Vercel dashboard, go to your project settings
2. Click "Domains"
3. Add your custom domain (e.g., `referral.foorsa.ma`)
4. Update DNS records as instructed

## Monitoring

- **Vercel Logs**: Real-time logs in Vercel dashboard
- **Supabase Logs**: Database query logs in Supabase dashboard
- **Google Analytics**: Track page views and conversions
- **Facebook Pixel**: Track leads and conversions

## Backup Strategy

1. **Database**: Use Supabase's automated backups (available on Pro plan)
2. **Code**: GitHub repository with full version history
3. **Manual Export**: Use Supabase's export feature for manual backups

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all environment variables are set
- Run `npm run build` locally to test

### Database Connection Issues
- Verify Supabase credentials
- Check if database tables exist
- Ensure service role key is correct (not anon key)

### Authentication Problems
- Check JWT_SECRET is set
- Verify ADMIN_PASSWORD matches
- Clear cookies and try again

## Security Notes

1. **Never commit** `.env.local` to Git (already in `.gitignore`)
2. **Rotate secrets** regularly (JWT_SECRET, passwords)
3. **Use HTTPS** always (Vercel provides this automatically)
4. **Monitor logs** for suspicious activity
5. **Limit admin access** - only trusted users should have admin password

## Scaling

The current setup can handle:
- **Ambassadors**: Unlimited
- **Leads**: Millions (with proper indexing)
- **Concurrent Users**: Vercel's serverless functions auto-scale
- **Database**: Supabase can handle 1000+ concurrent connections

For higher loads:
- Consider adding Redis cache for frequently accessed data
- Use Supabase's connection pooling (PgBouncer)
- Implement rate limiting for public endpoints

## Support

For issues or questions:
- Check logs in Vercel dashboard
- Review Supabase database logs
- Consult the README.md for API documentation
