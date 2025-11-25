# Login Session Fix - Quick Guide

## Issues Fixed

### 1. ✅ reCAPTCHA Error Fixed
- **Problem**: reCAPTCHA was loading on every page (including login), causing 401 errors
- **Fix**: Moved reCAPTCHA script to contact page only (where it's actually used)

### 2. ✅ Session Not Persisting Fixed
- **Problem**: Cookies with `secure: true` flag don't work on `http://localhost`
- **Fix**: Cookie secure flag now checks if URL is actually HTTPS (not just in NEXTAUTH_URL)

## What Changed

### `src/app/layout.tsx`
- Removed reCAPTCHA script from global layout
- reCAPTCHA now only loads on contact page

### `src/app/contact/page.tsx`
- Added reCAPTCHA script to contact page only

### `src/lib/auth.ts`
- Fixed cookie `secure` flag to check for localhost
- Cookies now work properly on `http://localhost:3000`

## Testing

1. **Clear browser cookies** (important!)
2. **Restart your dev server**
3. **Test login**:
   - Go to http://localhost:3000/login
   - Login with admin@thespecialistrealty.com / admin123
   - Should stay logged in after redirect

## If Still Having Issues

1. **Check NEXTAUTH_URL**:
   ```bash
   # Should be http://localhost:3000 for local dev
   # NOT https://your-site.netlify.app
   ```

2. **Clear cookies manually**:
   - Open browser DevTools → Application → Cookies
   - Delete all cookies for localhost:3000
   - Try login again

3. **Check console for errors**:
   - Should NOT see reCAPTCHA errors on login page
   - Should see session cookie being set

## Quick Fix Command

```bash
# Clear .next cache and restart
Remove-Item -Recurse -Force .next
npm run dev
```

Then test login again!

