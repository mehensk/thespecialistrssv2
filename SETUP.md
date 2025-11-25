# Admin & User Login System - Setup Guide

## Prerequisites

1. PostgreSQL database (local or Supabase)
2. Node.js 18+ installed
3. Environment variables configured

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/thespecialistrealty?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Activity Logging (Optional - for small teams, recommended to disable verbose logging)
# Set to "false" to disable all activity logging (saves database storage)
ENABLE_ACTIVITY_LOGGING=true

# Log login/logout events (default: false - not logged unless enabled)
# For small teams, you probably don't need to log every login
LOG_AUTH_ACTIONS=false

# Log update/edit actions (default: false - not logged unless enabled)
# Only CREATE, DELETE, APPROVE, REJECT are logged by default
LOG_UPDATE_ACTIONS=false

# Store minimal data (skip IP address and user agent) - default: false
# Set to "true" to save storage space by not storing IP/userAgent
LOG_MINIMAL_DATA=false
```

**Important:** 
- Generate a secure `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- Update `DATABASE_URL` with your actual PostgreSQL connection string
- For Supabase, use the connection string from your Supabase project settings

## Database Setup

1. **Run Prisma migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Seed the database with initial users:**
   ```bash
   npm run db:seed
   ```

   This creates:
   - Admin user: `admin@thespecialistrealty.com` / `admin123`
   - Agent user: `agent@thespecialistrealty.com` / `agent123`
   - Writer user: `writer@thespecialistrealty.com` / `writer123`

   **⚠️ Change these passwords immediately in production!**

## Running the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Public site: http://localhost:3000
   - Login page: http://localhost:3000/login
   - Admin dashboard: http://localhost:3000/admin/dashboard (admin only)
   - User dashboard: http://localhost:3000/dashboard (authenticated users)

## User Roles

### Admin (ADMIN)
- Full access to admin dashboard
- Can approve/edit/delete all listings and blogs
- Can manage users (create, edit, delete)
- Can view activity logs
- Access: `/admin/*`

### Sub-Users (AGENT, WRITER)
- Access to personal dashboard
- Can create/edit/delete their own listings and blogs
- Cannot approve content (requires admin approval)
- Cannot access admin routes
- Access: `/dashboard/*`

### Public
- No login required
- Can view published listings and blogs
- Can submit inquiries

## Key Features

### Authentication
- Email/password login via NextAuth.js v5
- JWT-based sessions
- Role-based access control
- Secure password hashing with bcrypt

### Route Protection
- Middleware protects admin routes (admin only)
- Middleware protects dashboard routes (authenticated users)
- 403 page for unauthorized access attempts
- Automatic redirects to login when needed

### Activity Logging
- **Configurable logging** - Control what gets logged to save database storage
- **By default logs:**
  - CREATE operations (new listings/blogs)
  - DELETE operations
  - APPROVE/REJECT actions
  - User management actions
- **By default skips:**
  - LOGIN/LOGOUT events (can enable with `LOG_AUTH_ACTIONS=true`)
  - UPDATE operations (can enable with `LOG_UPDATE_ACTIONS=true`)
- **For small teams (3-4 people):** Recommended to keep defaults or disable entirely with `ENABLE_ACTIVITY_LOGGING=false`
- Logs include: user, action, item type, metadata, IP address (optional), user agent (optional), timestamp

### Approval Workflow
- Sub-users create listings/blogs → marked as unpublished
- Admin reviews and approves → content becomes published
- Published content visible to public

## API Routes

### Listings
- `GET /api/listings` - Get all listings (filtered by published status)
- `POST /api/listings` - Create new listing (requires auth)
- `GET /api/listings/[id]` - Get single listing
- `PUT /api/listings/[id]` - Update listing (owner or admin)
- `POST /api/listings/[id]/delete` - Delete listing (owner only)
- `POST /api/admin/listings/[id]/approve` - Approve listing (admin only)
- `POST /api/admin/listings/[id]/delete` - Delete any listing (admin only)

### Blog Posts
- `GET /api/blog-posts` - Get all blog posts (filtered by published status)
- `POST /api/blog-posts` - Create new blog post (requires auth)
- `GET /api/blog-posts/[id]` - Get single blog post
- `PUT /api/blog-posts/[id]` - Update blog post (owner or admin)
- `POST /api/blogs/[id]/delete` - Delete blog post (owner only)
- `POST /api/admin/blogs/[id]/approve` - Approve blog post (admin only)
- `POST /api/admin/blogs/[id]/delete` - Delete any blog post (admin only)

### Users
- `POST /api/admin/users/[id]/delete` - Delete user (admin only)

## Database Schema

### User
- id, email (unique), name, password (hashed), role (ADMIN | AGENT | WRITER)
- Relations: listings, blogPosts, activities

### Listing
- id, title, description, price, location, city, bedrooms, bathrooms, size, etc.
- userId (creator), approvedBy, approvedAt, isPublished
- Relations: user (creator), approver (admin)

### BlogPost
- id, title, content, slug (unique), excerpt, featuredImage
- userId (creator), approvedBy, approvedAt, isPublished
- Relations: user (creator), approver (admin)

### Activity
- id, userId, action, itemType, itemId, metadata (JSON)
- ipAddress, userAgent, timestamp
- Relations: user

## Security Features

1. **Password Security**
   - Passwords hashed with bcrypt (10 rounds)
   - Never stored in plain text

2. **Session Security**
   - JWT tokens stored in httpOnly cookies
   - Secure session management via NextAuth

3. **Route Protection**
   - Middleware validates role on every request
   - Server-side permission checks in API routes
   - No admin links in public navbar

4. **Activity Tracking**
   - All sensitive actions logged
   - IP address and user agent captured
   - Full audit trail for security

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Ensure database exists

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your app URL
- Clear browser cookies if session issues persist

### Migration Issues
- Run `npx prisma generate` to regenerate Prisma Client
- Run `npx prisma migrate reset` to reset database (⚠️ deletes all data)
- Check Prisma schema for syntax errors

## Next Steps

1. Change default passwords after first login
2. Configure production environment variables
3. Set up database backups
4. Customize dashboard UI as needed
5. Add email notifications for approvals (optional)
6. Implement password reset functionality (optional)

