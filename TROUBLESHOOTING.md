# Troubleshooting Guide

## Common Errors and Solutions

### Error: "Unexpected end of JSON input" or HTTP 500 on `/api/auth/error`

This error typically occurs when:

1. **Missing NEXTAUTH_SECRET**
   - **Solution:** Add `NEXTAUTH_SECRET` to your `.env` file
   - Generate a secret: `openssl rand -base64 32`
   - Restart your development server after adding it

2. **Database Connection Issues**
   - **Solution:** Ensure your `DATABASE_URL` is correct in `.env`
   - Verify your database is running
   - Test connection: `npx prisma db pull`

3. **NextAuth Route Handler Issues**
   - **Solution:** Clear `.next` folder and restart:
     ```bash
     rm -rf .next
     npm run dev
     ```

### Error: "Cannot access admin dashboard"

1. **Check if logged in:**
   - Go to http://localhost:3000/login
   - Verify you're using admin credentials

2. **Verify user role:**
   - Check database: `SELECT * FROM "User" WHERE email = 'admin@thespecialistrealty.com';`
   - Ensure role is `ADMIN`

3. **Check environment variables:**
   - `NEXTAUTH_SECRET` must be set
   - `NEXTAUTH_URL` should be `http://localhost:3000`

### Error: "Database connection failed"

1. **Check DATABASE_URL format:**
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
   ```

2. **For Supabase:**
   - Use the connection string from Supabase dashboard
   - Make sure to use the "Connection pooling" string for production

3. **Test connection:**
   ```bash
   npx prisma db pull
   ```

### Error: "Error in PostgreSQL connection: Error { kind: Closed, cause: None }"

This error means Prisma cannot connect to your PostgreSQL database. Here's how to fix it:

#### **Step 1: Verify DATABASE_URL is set**
```bash
# Windows PowerShell
$env:DATABASE_URL

# Should show your connection string, not empty
```

If empty, check your `.env` file in the project root.

#### **Step 2: Check if database server is running**

**For Local PostgreSQL:**
```bash
# Windows - Check if PostgreSQL service is running
Get-Service -Name postgresql*

# If not running, start it:
Start-Service -Name postgresql-x64-XX  # Replace XX with your version
```

**For Docker PostgreSQL:**
```bash
docker ps
# Should show your postgres container running

# If not running:
docker start postgres
```

**For Neon/Supabase (Cloud):**
- Check your database dashboard
- Verify the connection string is correct
- Ensure your database hasn't been paused (Neon free tier pauses after inactivity)

#### **Step 3: Verify DATABASE_URL format**

**Local PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/thespecialistrealty?schema=public"
```

**Neon Database:**
```env
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
```
⚠️ **Important:** Use the **pooler** connection string (contains `-pooler`) for better connection handling.

**Supabase:**
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require"
```

#### **Step 4: Test the connection**

```bash
# Test with Prisma
npx prisma db pull

# Or test with psql (if installed)
psql "your-database-url-here"
```

#### **Step 5: Common fixes**

1. **Restart your database service:**
   ```bash
   # Windows - Restart PostgreSQL service
   Restart-Service -Name postgresql-x64-XX
   ```

2. **Clear Next.js cache and restart:**
   ```bash
   # Windows PowerShell
   Remove-Item -Recurse -Force .next
   npm run dev
   ```

3. **For Neon databases - Use connection pooling:**
   - Go to Neon dashboard → Connection Details
   - Select "Pooled connection" (not "Direct connection")
   - Copy the connection string with `-pooler` in the hostname
   - Update your `.env` file

4. **Check firewall/network:**
   - Ensure port 5432 (PostgreSQL) is not blocked
   - For cloud databases, check if your IP is whitelisted

5. **Verify credentials:**
   - Double-check username and password in DATABASE_URL
   - For cloud databases, ensure password hasn't changed

#### **Quick Diagnostic Script**

Create a file `test-db.js`:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.message.includes('Closed')) {
      console.error('\n💡 Connection closed error detected!');
      console.error('Check:');
      console.error('1. Is your database server running?');
      console.error('2. Is DATABASE_URL correct in .env?');
      console.error('3. Are credentials correct?');
    }
  } finally {
    await prisma.$disconnect();
  }
}

test();
```

Run it:
```bash
node test-db.js
```

### Error: "Activity logging failed"

This is a non-critical error. The login will still work, but activities won't be logged.

**Possible causes:**
- Database connection issue
- Activity table doesn't exist (run migrations)

**Solution:**
- Run migrations: `npx prisma migrate dev`
- Check database connection

### Error: "Session not found" after login

1. **Clear browser cookies:**
   - Clear all cookies for localhost:3000
   - Try logging in again

2. **Check NEXTAUTH_SECRET:**
   - Must be the same across server restarts
   - Don't change it while logged in

3. **Verify session provider:**
   - Ensure `SessionProvider` is in root layout
   - Check browser console for errors

## Quick Fixes

### Reset Everything

1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   ```

2. **Reset database (⚠️ deletes all data):**
   ```bash
   npx prisma migrate reset
   npm run db:seed
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

### Verify Setup

1. **Check environment variables:**
   ```bash
   # Should show your variables (don't commit this!)
   cat .env
   ```

2. **Verify database:**
   ```bash
   npx prisma studio
   # Opens database browser at http://localhost:5555
   ```

3. **Check NextAuth:**
   - Visit: http://localhost:3000/api/auth/providers
   - Should show available providers (Credentials)

## Environment Variables Checklist

Make sure you have these in `.env`:

```env
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional (for production)
NODE_ENV="development"
```

## Still Having Issues?

1. **Check server logs:**
   - Look at terminal where `npm run dev` is running
   - Check for error messages

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

3. **Verify database:**
   - Run: `npx prisma studio`
   - Check if tables exist
   - Verify users are created

4. **Test NextAuth directly:**
   - Visit: http://localhost:3000/api/auth/session
   - Should return JSON (empty if not logged in)

