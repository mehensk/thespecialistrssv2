# Netlify vs Localhost Cookie Configuration Comparison

## Environment Variables

### On Netlify (Production)
- `NODE_ENV` = `production` (automatically set by Netlify)
- `NEXTAUTH_URL` = `https://yoursite.netlify.app` (must be set in Netlify dashboard)
- URL does NOT contain `localhost`

### On Localhost (Development)
- `NODE_ENV` = `development` (or not set)
- `NEXTAUTH_URL` = `http://localhost:3000` (set manually)
- URL contains `localhost`

---

## Cookie Configuration Analysis

### 1. Session Token Cookie

**Cookie Name Logic:**
```typescript
name: process.env.NODE_ENV === 'production' && 
      process.env.NEXTAUTH_URL?.startsWith('https://') && 
      !process.env.NEXTAUTH_URL?.includes('localhost')
  ? '__Secure-authjs.session-token' 
  : 'authjs.session-token'
```

**On Netlify:**
- ✅ `NODE_ENV === 'production'` → `true`
- ✅ `NEXTAUTH_URL?.startsWith('https://')` → `true`
- ✅ `!NEXTAUTH_URL?.includes('localhost')` → `true`
- **Result:** `true && true && true` = `true`
- **Cookie Name:** `__Secure-authjs.session-token` ✅

**On Localhost:**
- ❌ `NODE_ENV === 'production'` → `false`
- **Result:** `false && ...` = `false`
- **Cookie Name:** `authjs.session-token` ✅

**Secure Flag:**
```typescript
secure: (process.env.NEXTAUTH_URL?.startsWith('https://') && 
        !process.env.NEXTAUTH_URL?.includes('localhost')) ?? false
```

**On Netlify:**
- ✅ `NEXTAUTH_URL?.startsWith('https://')` → `true`
- ✅ `!NEXTAUTH_URL?.includes('localhost')` → `true`
- **Result:** `true && true` = `true`
- **Secure:** `true` ✅

**On Localhost:**
- ❌ `NEXTAUTH_URL?.startsWith('https://')` → `false` (http://)
- **Result:** `false && ...` = `false`
- **Secure:** `false` ✅

---

### 2. Callback URL Cookie

**Cookie Name Logic:**
```typescript
name: process.env.NODE_ENV === 'production' && 
      process.env.NEXTAUTH_URL?.startsWith('https://') && 
      !process.env.NEXTAUTH_URL?.includes('localhost')
  ? '__Secure-authjs.callback-url' 
  : 'authjs.callback-url'
```

**On Netlify:**
- ✅ All conditions true → **Cookie Name:** `__Secure-authjs.callback-url` ✅

**On Localhost:**
- ❌ `NODE_ENV !== 'production'` → **Cookie Name:** `authjs.callback-url` ✅

**Secure Flag:**
- **On Netlify:** `secure: true` ✅
- **On Localhost:** `secure: false` ✅

---

### 3. CSRF Token Cookie

**Cookie Name Logic:**
```typescript
name: process.env.NODE_ENV === 'production' && 
      process.env.NEXTAUTH_URL?.startsWith('https://') && 
      !process.env.NEXTAUTH_URL?.includes('localhost')
  ? '__Host-authjs.csrf-token' 
  : 'authjs.csrf-token'
```

**On Netlify:**
- ✅ All conditions true → **Cookie Name:** `__Host-authjs.csrf-token` ✅
- **Note:** `__Host-` prefix requires:
  - HTTPS connection ✅
  - `secure: true` ✅
  - `path: '/'` ✅ (already set)

**On Localhost:**
- ❌ `NODE_ENV !== 'production'` → **Cookie Name:** `authjs.csrf-token` ✅

**Secure Flag:**
- **On Netlify:** `secure: true` ✅
- **On Localhost:** `secure: false` ✅

---

## Summary

### ✅ Netlify (Production) Behavior

| Cookie | Name | Secure | Status |
|--------|------|--------|--------|
| Session Token | `__Secure-authjs.session-token` | `true` | ✅ Correct |
| Callback URL | `__Secure-authjs.callback-url` | `true` | ✅ Correct |
| CSRF Token | `__Host-authjs.csrf-token` | `true` | ✅ Correct |

**All cookies will:**
- Use secure prefixes (`__Secure-` or `__Host-`)
- Have `secure: true` (HTTPS only)
- Work correctly on Netlify's HTTPS environment

### ✅ Localhost (Development) Behavior

| Cookie | Name | Secure | Status |
|--------|------|--------|--------|
| Session Token | `authjs.session-token` | `false` | ✅ Correct |
| Callback URL | `authjs.callback-url` | `false` | ✅ Correct |
| CSRF Token | `authjs.csrf-token` | `false` | ✅ Correct |

**All cookies will:**
- Use standard names (no secure prefixes)
- Have `secure: false` (works on HTTP)
- Work correctly on localhost HTTP environment

---

## Critical Requirements for Netlify

### ⚠️ Must Set in Netlify Dashboard:

1. **`NEXTAUTH_URL`** = `https://yoursite.netlify.app`
   - Must start with `https://`
   - Must NOT contain `localhost`
   - Example: `https://thespecialistrealty.netlify.app`

2. **`NEXTAUTH_SECRET`** = (your secret key)
   - Generate with: `openssl rand -base64 32`

3. **`DATABASE_URL`** = (your Neon database URL)

### ✅ Automatic on Netlify:

- `NODE_ENV` = `production` (automatically set)

---

## Potential Issues & Solutions

### Issue 1: NEXTAUTH_URL Not Set Correctly
**Symptom:** Cookies won't use secure prefixes, authentication may fail
**Solution:** Set `NEXTAUTH_URL` in Netlify dashboard to your HTTPS URL

### Issue 2: NEXTAUTH_URL Contains localhost
**Symptom:** Cookies won't use secure prefixes even on HTTPS
**Solution:** Ensure `NEXTAUTH_URL` is your Netlify domain, not localhost

### Issue 3: Mixed Environment
**Symptom:** If `NODE_ENV=production` but `NEXTAUTH_URL=http://localhost:3000`
**Result:** Cookie names will use secure prefixes but `secure: false` (inconsistent)
**Solution:** This shouldn't happen on Netlify, but ensure `NEXTAUTH_URL` is HTTPS

---

## Verification Checklist

Before deploying to Netlify, verify:

- [ ] `NEXTAUTH_URL` is set in Netlify dashboard
- [ ] `NEXTAUTH_URL` starts with `https://`
- [ ] `NEXTAUTH_URL` does NOT contain `localhost`
- [ ] `NEXTAUTH_SECRET` is set in Netlify dashboard
- [ ] `DATABASE_URL` is set in Netlify dashboard
- [ ] Build simulation passes: `npm run build:netlify-local`

---

## Conclusion

✅ **Your code will work correctly on Netlify** if:
1. `NEXTAUTH_URL` is set to your HTTPS Netlify URL
2. All required environment variables are set in Netlify dashboard

The cookie configuration correctly differentiates between:
- **Production (Netlify):** Secure cookies with `__Secure-`/`__Host-` prefixes
- **Development (Localhost):** Standard cookies without secure prefixes

This ensures:
- ✅ Security on production (HTTPS-only cookies)
- ✅ Functionality on localhost (HTTP-compatible cookies)
- ✅ No CSRF token issues
- ✅ Proper authentication flow

