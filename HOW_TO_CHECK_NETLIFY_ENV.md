# How to Check Netlify Environment Variables

## Method 1: Through Netlify Dashboard (Recommended)

### Step-by-Step Instructions:

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com/
   - Sign in to your account

2. **Select Your Site**
   - Click on your site name from the dashboard

3. **Navigate to Site Settings**
   - Click on **"Site settings"** in the top navigation
   - (Or click the gear icon ⚙️)

4. **Open Environment Variables**
   - In the left sidebar, click on **"Environment variables"**
   - You'll see all your environment variables listed

5. **Check DATABASE_URL**
   - Look for `DATABASE_URL` in the list
   - The value will be shown (or hidden for security - click "Show" to reveal it)

6. **Compare with Your Local Database**
   - Check if it matches your local `.env` file's `DATABASE_URL`
   - If they're the same → All your data (users, listings, blogs) will be there
   - If they're different → Only seed script data will exist

---

## Method 2: Through Netlify CLI

If you have Netlify CLI installed:

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# List environment variables
netlify env:list

# View specific variable
netlify env:get DATABASE_URL
```

---

## Method 3: Through Build Logs

1. **Go to Netlify Dashboard**
2. **Click on "Deploys" tab**
3. **Open the latest deploy**
4. **Click on "Deploy log"**
5. Look for environment variable references (though values won't be shown for security)

---

## What to Look For

### ✅ Same Database (Data Persists)
If your Netlify `DATABASE_URL` matches your local `.env`:
- **All users** → Will be in production
- **All listings** → Will be in production  
- **All blogs** → Will be in production
- You're using the **same database** for dev and production

### ❌ Different Database (Fresh Start)
If your Netlify `DATABASE_URL` is different from your local `.env`:
- **Only 3 default users** → From seed script
  - `admin@thespecialistrealty.com`
  - `agent@thespecialistrealty.com`
  - `writer@thespecialistrealty.com`
- **No listings** → Empty database
- **No blogs** → Empty database
- You're using a **separate database** for production

---

## Example: What Your DATABASE_URL Looks Like

### Neon Database (from your seed-neon.js):
```
postgresql://neondb_owner:password@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Supabase Database:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Local PostgreSQL:
```
postgresql://postgres:password@localhost:5432/thespecialistrealty?schema=public
```

---

## How to Set DATABASE_URL in Netlify (If Missing)

1. **Go to Netlify Dashboard** → Your Site → **Site settings** → **Environment variables**
2. **Click "Add a variable"**
3. **Key:** `DATABASE_URL`
4. **Value:** Your PostgreSQL connection string
5. **Scopes:** Select which environments (Production, Deploy Previews, Branch deploys)
6. **Click "Save"**

---

## Important Notes

⚠️ **Security Warning:**
- Never commit your `.env` file to git
- Never share your `DATABASE_URL` publicly (it contains credentials)
- Always use Netlify's environment variables for production secrets

✅ **Best Practice:**
- Use the **same database** for development and production (easier data management)
- OR use **separate databases** but manually migrate data when needed
- Keep a backup of your production database regularly

