# Environment Variable Values

## NEXTAUTH_SECRET
**Value:** `jCzU1VJ3qVzYC4M+93TDnXC9SJcs0ZHOnzDUV4YyP9w=`

**Use the SAME value for both:**
- Local development (`.env` file)
- Netlify production (Environment variables)

## NEXTAUTH_URL

### For Local Development (`.env` file):
```
NEXTAUTH_URL="http://localhost:3000"
```

### For Netlify Production (Environment variables):
```
NEXTAUTH_URL="https://your-site-name.netlify.app"
```
**Replace `your-site-name` with your actual Netlify site name**

To find your Netlify URL:
1. Go to https://app.netlify.com/
2. Click on your site
3. Your URL is shown at the top (e.g., `https://amazing-site-123.netlify.app`)

## Database URLs

### Local Development (`.env` file):
Use your **"development" branch** connection string from Neon:
```
DATABASE_URL="postgresql://user:password@host/project-development?sslmode=require"
```

### Netlify Production (Environment variables):
Use your **"production" branch** connection string from Neon:
```
DATABASE_URL="postgresql://user:password@host/project-production?sslmode=require"
```

**Note:** Each Neon branch has its own connection string. Get them from the branch's Connection Details in Neon dashboard.

## Quick Setup Steps

1. **Get connection strings from Neon branches:**
   - Go to https://console.neon.tech/
   - Click on **"development"** branch → **Connection Details** → Copy connection string
   - Click on **"production"** branch → **Connection Details** → Copy connection string
   - (You already have these branches set up!)

2. **Update local `.env` file:**
   ```env
   DATABASE_URL="[DEV Neon connection string]"
   NEXTAUTH_SECRET="jCzU1VJ3qVzYC4M+93TDnXC9SJcs0ZHOnzDUV4YyP9w="
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Set up local dev database:**
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

4. **Set up Netlify environment variables:**
   - Go to Netlify Dashboard → Site settings → Environment variables
   - Add:
     - `DATABASE_URL` = [PRODUCTION Neon connection string]
     - `NEXTAUTH_SECRET` = `jCzU1VJ3qVzYC4M+93TDnXC9SJcs0ZHOnzDUV4YyP9w=`
     - `NEXTAUTH_URL` = `https://your-site-name.netlify.app`

5. **Set up production database (first deploy):**
   - Netlify will automatically run migrations and seed on first deploy
   - Or manually run:
     ```bash
     DATABASE_URL="[PROD connection]" npx prisma migrate deploy
     DATABASE_URL="[PROD connection]" npm run db:seed
     ```

