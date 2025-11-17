# Database Setup Guide

## The Problem

You're getting "Unexpected end of JSON input" because the database connection is failing. Your `.env` file uses `prisma+postgres://` which requires Prisma's local development server.

## Solution Options

### Option 1: Use Prisma Local Server (Current Setup)

If you want to keep using Prisma's local server:

1. **Start Prisma Local Server:**
   ```bash
   npx prisma dev
   ```
   This will start a local PostgreSQL server and keep it running.

2. **In a NEW terminal, run your Next.js app:**
   ```bash
   npm run dev
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed the database:**
   ```bash
   npm run db:seed
   ```

### Option 2: Use Regular PostgreSQL (Recommended)

Switch to a standard PostgreSQL connection:

1. **Install PostgreSQL** (if not already installed):
   - Download from: https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

2. **Update your `.env` file:**
   Replace the `DATABASE_URL` line with:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/thespecialistrealty?schema=public"
   ```
   (Adjust username, password, and database name as needed)

3. **Create the database:**
   ```bash
   # Using psql (if installed)
   psql -U postgres
   CREATE DATABASE thespecialistrealty;
   \q
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the database:**
   ```bash
   npm run db:seed
   ```

6. **Start your app:**
   ```bash
   npm run dev
   ```

### Option 3: Use Supabase (Cloud Database)

1. **Create a Supabase account:** https://supabase.com

2. **Create a new project**

3. **Get connection string:**
   - Go to Project Settings > Database
   - Copy the "Connection string" (URI format)

4. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

5. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Seed the database:**
   ```bash
   npm run db:seed
   ```

## Quick Fix (Try This First)

If you want to quickly test if it's a database issue:

1. **Stop your Next.js server** (Ctrl+C)

2. **Clear Next.js cache:**
   ```bash
   Remove-Item -Recurse -Force .next
   ```

3. **Try Option 1 or 2 above** to set up your database

4. **Restart:**
   ```bash
   npm run dev
   ```

## Verify Database Connection

After setting up, test the connection:

```bash
node test-db-connection.js
```

You should see:
```
✓ Database connection successful!
✓ Found X users in database
```

## After Database is Working

Once your database is connected:

1. **Run migrations** (creates tables):
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Seed users** (creates admin/agent/writer accounts):
   ```bash
   npm run db:seed
   ```

3. **Test login:**
   - Go to: http://localhost:3000/login
   - Email: `admin@thespecialistrealty.com`
   - Password: `admin123`

The "Unexpected end of JSON input" error should be gone!

