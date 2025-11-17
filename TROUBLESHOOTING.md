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

