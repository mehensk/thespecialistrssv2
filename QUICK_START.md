# Quick Start Guide

## 1. How to Access Admin Dashboard

### Step 1: Set Up Database

First, make sure you have your database configured:

1. **Create a `.env` file** in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/thespecialistrealty?schema=public"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

2. **Generate NEXTAUTH_SECRET** (run in terminal):
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as your `NEXTAUTH_SECRET` value.

### Step 2: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### Step 3: Seed Database with Admin User

```bash
npm run db:seed
```

This creates an admin user with:
- **Email:** `admin@thespecialistrealty.com`
- **Password:** `admin123`

### Step 4: Start the Development Server

```bash
npm run dev
```

### Step 5: Log In as Admin

1. Go to: **http://localhost:3000/login**
2. Enter credentials:
   - Email: `admin@thespecialistrealty.com`
   - Password: `admin123`
3. Click "Sign In"
4. You'll be automatically redirected to: **http://localhost:3000/admin/dashboard**

### Direct Admin Dashboard URL

Once logged in as admin, you can access:
- **Admin Dashboard:** http://localhost:3000/admin/dashboard
- **User Management:** http://localhost:3000/admin/users
- **Listings Management:** http://localhost:3000/admin/listings
- **Blogs Management:** http://localhost:3000/admin/blogs
- **Activity Logs:** http://localhost:3000/admin/logs

---

## 2. How to Create a Sample Blog

### Option A: Through Admin Dashboard (Recommended)

1. **Log in as Admin** (see steps above)

2. **Navigate to Blogs Management:**
   - Go to: http://localhost:3000/admin/blogs
   - Or click "Blogs" in the admin sidebar

3. **Create a New Blog:**
   - Click the "New Blog Post" button (if available)
   - Or use the API directly (see Option B below)

### Option B: Through Sub-User Dashboard

1. **Log in as a Sub-User:**
   - Email: `agent@thespecialistrealty.com` or `writer@thespecialistrealty.com`
   - Password: `agent123` or `writer123`

2. **Go to My Blogs:**
   - Navigate to: http://localhost:3000/dashboard/blogs
   - Click "New Blog Post"

3. **Fill in Blog Details:**
   - Title: e.g., "Top 5 Luxury Condos in Makati"
   - Slug: e.g., "top-5-luxury-condos-makati" (URL-friendly, lowercase, hyphens)
   - Content: Your blog post content (HTML or plain text)
   - Excerpt: Short summary (optional)
   - Featured Image: Image URL (optional)

4. **Submit:**
   - The blog will be created but marked as "Pending Approval"
   - An admin needs to approve it before it's published

5. **Admin Approval:**
   - Admin logs in and goes to: http://localhost:3000/admin/blogs
   - Finds the pending blog
   - Clicks the checkmark (✓) icon to approve
   - Blog becomes published and visible to public

### Option C: Using API Directly (For Testing)

You can create a blog using the API:

```bash
curl -X POST http://localhost:3000/api/blog-posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample Blog Post",
    "slug": "sample-blog-post",
    "content": "This is the content of my blog post...",
    "excerpt": "A short excerpt about the blog post"
  }'
```

**Note:** You'll need to be authenticated (logged in) to use the API.

---

## Quick Reference

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@thespecialistrealty.com | admin123 |
| Agent | agent@thespecialistrealty.com | agent123 |
| Writer | writer@thespecialistrealty.com | writer123 |

### Important URLs

- **Login:** http://localhost:3000/login
- **Admin Dashboard:** http://localhost:3000/admin/dashboard
- **User Dashboard:** http://localhost:3000/dashboard
- **Public Site:** http://localhost:3000

### Blog Creation Checklist

- [ ] Logged in as admin or sub-user
- [ ] Navigate to blog management page
- [ ] Fill in title, slug, and content
- [ ] Submit blog post
- [ ] (If sub-user) Wait for admin approval
- [ ] (If admin) Approve the blog post
- [ ] Blog is now published and visible

---

## Troubleshooting

### Can't Access Admin Dashboard?

1. **Check if you're logged in:** Go to http://localhost:3000/login
2. **Verify your role:** Make sure you logged in with the admin email
3. **Check environment variables:** Ensure `NEXTAUTH_SECRET` is set
4. **Check database:** Make sure migrations ran successfully

### Blog Not Appearing?

1. **Check approval status:** Blogs need admin approval to be published
2. **Check if logged in:** You need to be authenticated to create blogs
3. **Check slug uniqueness:** Each blog slug must be unique
4. **Check database:** Verify the blog was created in the database

---

## Next Steps

- Create more blog posts
- Create property listings
- Manage users
- View activity logs
- Customize the dashboard

