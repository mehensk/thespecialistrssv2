# Quick Database Setup - 5 Minutes

## Step 1: Choose Your Database

### Option A: Neon (Cloud - Recommended for Production)
1. Go to https://neon.tech and create account
2. Create a new project
3. Copy the connection string
4. Add to `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   ```

### Option B: Local PostgreSQL
1. Install PostgreSQL or use Docker:
   ```bash
   docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   ```
2. Add to `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/thespecialistrealty?schema=public"
   ```

### Option C: Supabase (Cloud)
1. Go to https://supabase.com and create account
2. Create a new project
3. Copy connection string from Settings > Database
4. Add to `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require"
   ```

## Step 2: Set Up Database

```bash
# 1. Run migrations (creates tables)
npx prisma migrate dev --name init

# 2. Seed database (creates admin user)
npm run db:seed
```

## Step 3: Verify It Works

```bash
# Check database health
curl http://localhost:3000/api/health/database

# Or start the app
npm run dev
```

## Step 4: Test Login

- Go to: http://localhost:3000/login
- Email: `admin@thespecialistrealty.com`
- Password: `admin123`

## ✅ Done!

The database connection now has automatic retry and health checks, so connection issues are handled automatically.

## Troubleshooting

### Database Not Connecting?

1. **Check DATABASE_URL:**
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL
   ```

2. **Test connection:**
   ```bash
   npx prisma db pull
   ```

3. **Check health:**
   ```bash
   curl http://localhost:3000/api/health/database
   ```

### Still Having Issues?

See [DATABASE_FIX.md](./DATABASE_FIX.md) for detailed troubleshooting.

