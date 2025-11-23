# Testing Login Flow Locally (Simulating Netlify)

## Why Test in Production Mode?

Netlify uses serverless functions which have different cookie behavior than local dev mode. To simulate this:

1. **Build the app** (creates production build like Netlify)
2. **Run in production mode** (uses same build as Netlify)
3. **Test the login flow** (will catch cookie timing issues)

## Steps to Test Locally

### 1. Build the App
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

### 3. Test Login Flow
- Navigate to: http://localhost:3000/login
- Use credentials:
  - Email: `admin@thespecialistrealty.com`
  - Password: `admin123`
- Check if redirect to `/admin/dashboard` works

### 4. Check Console Logs
Open browser DevTools (F12) and check:
- Console tab for any errors or log messages
- Network tab to see API calls and responses
- Look for "Login successful, redirecting to:" message

## What to Look For

✅ **Success:**
- Login redirects to `/admin/dashboard` or `/dashboard`
- No "error=no-token" in URL
- Console shows "✅ Login successful, redirecting to:"

❌ **Failure:**
- Stays on login page
- URL shows `?error=no-token`
- Console shows "Session not available after retries"

## Differences from Dev Mode

- **Production mode** uses the same build as Netlify
- **Cookie timing** is more similar to serverless functions
- **Session retrieval** may take longer (hence the retries in code)

## Note

Even in production mode locally, it's not 100% identical to Netlify's serverless environment, but it's much closer than dev mode. The cookie timing issues should appear here if they exist.

