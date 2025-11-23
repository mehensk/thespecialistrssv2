# Quick Setup: Upload Local Data to Development Branch

> **Note for Windows Users:** If you're using PowerShell on Windows, use the PowerShell commands shown below instead of the bash commands.

## Step 1: Get Development Branch Connection String

1. Go to https://console.neon.tech/
2. Click on **"development"** branch
3. Click **"Connection Details"**
4. Copy the connection string (it looks like: `postgresql://user:pass@host/db?sslmode=require`)

## Step 2: Check What's Currently in Development Branch

Run this command (replace with your actual connection string):

**For Bash/Linux/Mac:**
```bash
DEV_DATABASE_URL="postgresql://your-connection-string-here" npm run check:dev-branch
```

**For Windows PowerShell:**
```powershell
$env:DEV_DATABASE_URL="postgresql://your-connection-string-here"; npm run check:dev-branch
```

This will show you:
- How many users, listings, blogs, activities are in the development branch
- Sample data from each table
- Whether the schema is set up

## Step 3: Set Up Schema (If Needed)

If the development branch is empty or missing tables, run migrations:

**For Bash/Linux/Mac:**
```bash
DEV_DATABASE_URL="postgresql://your-connection-string-here" npx prisma migrate deploy
```

**For Windows PowerShell:**
```powershell
$env:DEV_DATABASE_URL="postgresql://your-connection-string-here"; npx prisma migrate deploy
```

## Step 4: Upload Your Local Data to Development Branch

Run the migration script (replace with your actual connection string):

**For Bash/Linux/Mac:**
```bash
DEV_DATABASE_URL="postgresql://your-connection-string-here" npm run migrate:to-dev
```

**For Windows PowerShell:**
```powershell
$env:DEV_DATABASE_URL="postgresql://your-connection-string-here"; npm run migrate:to-dev
```

This will:
- Copy all users from your local database
- Copy all listings
- Copy all blogs
- Copy recent activities (last 1000)
- Use upsert (won't duplicate if data already exists)

## Step 5: Verify the Migration

Check the development branch again:

**For Bash/Linux/Mac:**
```bash
DEV_DATABASE_URL="postgresql://your-connection-string-here" npm run check:dev-branch
```

**For Windows PowerShell:**
```powershell
$env:DEV_DATABASE_URL="postgresql://your-connection-string-here"; npm run check:dev-branch
```

## Step 6: Update Your Local .env (Optional)

If you want to use the development branch for local development, update your `.env`:

```env
DATABASE_URL="postgresql://your-development-branch-connection-string"
NEXTAUTH_SECRET="jCzU1VJ3qVzYC4M+93TDnXC9SJcs0ZHOnzDUV4YyP9w="
NEXTAUTH_URL="http://localhost:3000"
```

Then run:
```bash
npm run dev
```

