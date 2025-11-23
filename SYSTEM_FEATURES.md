# The Specialist Realty - Complete System Features Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Authentication & Authorization](#authentication--authorization)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Property Listings Management](#property-listings-management)
6. [Blog Management](#blog-management)
7. [Admin Features](#admin-features)
8. [User Dashboard Features](#user-dashboard-features)
9. [Public Features](#public-features)
10. [Image Upload & Processing](#image-upload--processing)
11. [Contact Form & Communication](#contact-form--communication)
12. [Activity Logging System](#activity-logging-system)
13. [Security Features](#security-features)
14. [API Endpoints](#api-endpoints)
15. [Database Schema](#database-schema)
16. [UI/UX Features](#uiux-features)
17. [Performance Optimizations](#performance-optimizations)

---

## System Overview

The Specialist Realty is a comprehensive real estate management platform built with Next.js 16, TypeScript, and Tailwind CSS. The system enables real estate agents and writers to create, manage, and publish property listings and blog posts, with a robust approval workflow managed by administrators.

### Key Capabilities
- Multi-user content management system
- Property listing creation and management
- Blog post creation and management
- Role-based access control (Admin, Agent, Writer)
- Content approval workflow
- Public-facing property and blog browsing
- Contact form with spam protection
- Comprehensive activity logging
- Image upload and optimization
- User management and password reset

---

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Geist Sans** - Primary font (body & navigation)
- **Sora** - Brand font (logo)

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **NextAuth.js v5** - Authentication system
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database (via Neon or similar)
- **bcryptjs** - Password hashing
- **Sharp** - Image processing and optimization

### Third-Party Services
- **EmailJS** - Email service for contact form submissions
- **Google reCAPTCHA v3** - Spam protection
- **Netlify** - Hosting platform (with Next.js plugin)

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **tsx** - TypeScript execution
- **Prisma Migrate** - Database migrations

---

## Authentication & Authorization

### Authentication System
- **Provider**: NextAuth.js v5 with Credentials Provider
- **Session Strategy**: JWT-based sessions
- **Password Security**: bcryptjs hashing with salt rounds
- **Login Page**: Custom login page at `/login`
- **Session Management**: Server-side session validation

### Authentication Features
- Email/password login
- Secure password hashing (bcryptjs)
- JWT token-based sessions
- Automatic session validation
- Logout functionality
- Session persistence across page reloads
- Login activity logging

### Route Protection
- **Middleware-based Protection**: Next.js middleware protects routes
- **Admin Routes**: `/admin/*` - Only ADMIN role allowed
- **Dashboard Routes**: `/dashboard/*` - Authenticated users only
- **Public Routes**: `/`, `/listings`, `/blog`, `/contact`, `/login`
- **403 Page**: Custom unauthorized access page
- **Automatic Redirects**: Unauthenticated users redirected to login

### Security Measures
- Password minimum length: 8 characters
- Password visibility toggle in forms
- Secure password reset functionality (admin-initiated)
- Session timeout handling
- CSRF protection via NextAuth

---

## User Roles & Permissions

### User Roles

#### 1. ADMIN
- **Full System Access**
  - Access to all admin routes (`/admin/*`)
  - User management (create, edit, delete users)
  - Password reset for any user
  - Content approval (listings and blogs)
  - Delete any listing or blog
  - View all activity logs
  - System statistics dashboard
  - Can create/edit/delete own content
  - Can approve/reject content from other users

#### 2. AGENT (Default Role)
- **Content Creation**
  - Access to dashboard (`/dashboard/*`)
  - Create/edit/delete own listings
  - Create/edit/delete own blog posts
  - View own activity logs
  - Change own password
- **Restrictions**
  - Cannot approve content (requires admin approval)
  - Cannot access admin routes
  - Cannot manage other users
  - Cannot delete other users' content

#### 3. WRITER
- **Content Creation**
  - Access to dashboard (`/dashboard/*`)
  - Create/edit/delete own blog posts
  - View own activity logs
  - Change own password
- **Restrictions**
  - Cannot create listings (AGENT-only feature)
  - Cannot approve content
  - Cannot access admin routes
  - Cannot manage other users

### Permission Matrix

| Feature | ADMIN | AGENT | WRITER | Public |
|---------|-------|-------|--------|--------|
| View published listings | ✅ | ✅ | ✅ | ✅ |
| View published blogs | ✅ | ✅ | ✅ | ✅ |
| Create listings | ✅ | ✅ | ❌ | ❌ |
| Edit own listings | ✅ | ✅ | ❌ | ❌ |
| Delete own listings | ✅ | ✅ | ❌ | ❌ |
| Create blogs | ✅ | ✅ | ✅ | ❌ |
| Edit own blogs | ✅ | ✅ | ✅ | ❌ |
| Delete own blogs | ✅ | ✅ | ✅ | ❌ |
| Approve listings | ✅ | ❌ | ❌ | ❌ |
| Approve blogs | ✅ | ❌ | ❌ | ❌ |
| Delete any listing | ✅ | ❌ | ❌ | ❌ |
| Delete any blog | ✅ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| View all activity logs | ✅ | ❌ | ❌ | ❌ |
| View own activity logs | ✅ | ✅ | ✅ | ❌ |
| Change password | ✅ | ✅ | ✅ | ❌ |
| Submit contact form | ✅ | ✅ | ✅ | ✅ |

---

## Property Listings Management

### Listing Data Model

#### Basic Information
- **Title** (required) - Property title
- **Description** (required) - Detailed property description
- **Location** (required) - General location
- **City** (optional) - Specific city
- **Address** (optional) - Full street address

#### Property Details
- **Price** (optional) - Property price (float)
- **Listing Type** - Sale or Rent
- **Property Type** - Condominium, House and Lot, Townhouse, Apartment, Penthouse, Lot, Building, Commercial
- **Bedrooms** (optional) - Number of bedrooms
- **Bathrooms** (optional) - Number of bathrooms
- **Size** (optional) - Property size in square meters
- **Year Built** (optional) - Construction year
- **Parking** (optional) - Number of parking spaces
- **Floor** (optional) - Floor number
- **Total Floors** (optional) - Total floors in building
- **Property ID** (optional) - Custom property identifier
- **Available** (boolean, default: true) - Availability status

#### Media
- **Images** (array) - Multiple property images
  - Maximum: Unlimited (practical limit based on performance)
  - Cover photo selection
  - Image reordering
  - Image deletion

#### Amenities
- **Amenities** (JSON array) - Selected amenities from predefined list
  - 30+ predefined amenities with icons
  - Categories: Interior, Services, Building, Location, Security
  - Examples: Air Conditioning, Swimming Pool, Fitness Center, 24/7 Security, Wi-Fi Included, etc.

### Listing Features

#### Creation
- **Form-based Creation**: Comprehensive form at `/dashboard/listings/new`
- **Image Upload**: Drag-and-drop or click to upload
- **Cover Photo Selection**: Choose primary image
- **Real-time Validation**: Client-side validation
- **Auto-save Draft**: Form state persistence
- **Preview**: Preview before submission

#### Editing
- **Edit Own Listings**: `/dashboard/listings/[id]/edit`
- **Edit Any Listing** (Admin only): `/admin/listings/[id]/edit`
- **Image Management**: Add, remove, reorder images
- **Cover Photo Change**: Update cover photo
- **Form Pre-population**: All fields pre-filled

#### Viewing
- **Public Listing Page**: `/listings/[id]`
  - Image gallery with zoom
  - Thumbnail navigation
  - Keyboard navigation (arrow keys, ESC)
  - Image carousel in zoom modal
  - Property details display
  - Amenities with icons
  - Contact agent sidebar
  - Request information button
  - Share functionality (UI ready)
  - Save property button (UI ready)
  - Breadcrumb navigation
  - Responsive design

#### Listing Listings
- **Public Listings Page**: `/listings`
  - Grid/List view toggle
  - Filter by:
    - Listing type (Sale/Rent)
    - Property type
    - Price range
    - Bedrooms
    - Bathrooms
    - City
  - Sort by:
    - Price (low to high, high to low)
    - Date (newest first, oldest first)
  - Search functionality
  - Pagination
  - Featured listings section
  - Responsive card layout

#### Approval Workflow
- **Creation**: Listings created as `isPublished: false`
- **Admin Review**: Admin views pending listings
- **Approval**: Admin approves listing → `isPublished: true`
- **Rejection**: Admin can delete/reject listings
- **Public Visibility**: Only published listings visible to public
- **Approval Tracking**: Records approver and approval timestamp

#### Dashboard Management
- **My Listings**: `/dashboard/listings`
  - View all own listings
  - Filter by status (Published/Pending)
  - Edit/Delete actions
  - Quick stats (total, published, pending)
  - Compact card view

---

## Blog Management

### Blog Post Data Model

#### Content
- **Title** (required) - Blog post title
- **Slug** (required, unique) - URL-friendly identifier
  - Auto-generated from title
  - Manual override available
  - Format: lowercase, hyphens, alphanumeric
- **Content** (required) - Full blog post content (text)
- **Excerpt** (optional) - Short summary for previews
- **Images** (array) - Up to 5 images
  - Cover photo selection
  - Images distributed throughout content

#### Metadata
- **User ID** - Creator reference
- **Approved By** - Admin who approved (optional)
- **Approved At** - Approval timestamp (optional)
- **Is Published** - Publication status (default: false)
- **Created At** - Creation timestamp
- **Updated At** - Last update timestamp

### Blog Features

#### Creation
- **Form-based Creation**: `/dashboard/blogs/new`
- **Title Input**: Auto-generates slug
- **Slug Editing**: Manual slug override
- **Rich Text Area**: Content textarea
- **Excerpt Field**: Optional summary
- **Image Upload**: Up to 5 images
  - Drag-and-drop support
  - Click to upload
  - Cover photo selection
  - Image preview
  - Remove images
- **Validation**: Required fields validation
- **Success Feedback**: Success message and redirect

#### Editing
- **Edit Own Blogs**: `/dashboard/blogs/[id]/edit`
- **Edit Any Blog** (Admin only): Admin can edit any blog
- **Form Pre-population**: All fields pre-filled
- **Image Management**: Add/remove/reorder images
- **Cover Photo Update**: Change cover photo
- **Slug Editing**: Update slug (with uniqueness check)

#### Viewing
- **Public Blog Page**: `/blog/[slug]`
  - Full blog post display
  - Cover image
  - Author information
  - Publication date
  - Content formatting
  - Image gallery
  - Related posts (future feature)
  - Social sharing (future feature)

#### Blog Listings
- **Public Blog Page**: `/blog`
  - Grid layout (3 columns on desktop)
  - Blog card previews
  - Cover image
  - Title and excerpt
  - Author name
  - Publication date
  - Read more link
  - Responsive design

#### Approval Workflow
- **Creation**: Blogs created as `isPublished: false`
- **Admin Review**: Admin views pending blogs
- **Approval**: Admin approves blog → `isPublished: true`
- **Rejection**: Admin can delete/reject blogs
- **Public Visibility**: Only published blogs visible to public
- **Approval Tracking**: Records approver and approval timestamp

#### Dashboard Management
- **My Blogs**: `/dashboard/blogs`
  - View all own blogs
  - Filter by status (Published/Pending)
  - Edit/Delete actions
  - Quick stats (total, published, pending)
  - Compact card view

---

## Admin Features

### Admin Dashboard
- **Location**: `/admin/dashboard`
- **Statistics Cards**:
  - Total Users
  - Total Listings
  - Total Blogs
  - Pending Approvals (listings + blogs)
- **Recent Activity**: Last 10 system activities
- **Quick Access**: Links to all admin sections

### User Management
- **Location**: `/admin/users`
- **Features**:
  - View all users in table format
  - User information:
    - Name
    - Email
    - Role (with color-coded badges)
    - Listings count
    - Blogs count
    - Created date
  - **Actions**:
    - Create new user (`/admin/users/new`)
    - Edit user (`/admin/users/[id]/edit`)
    - Reset password (admin-initiated)
    - Delete user (cannot delete self)
  - **User Creation Form**:
    - Name input
    - Email input (unique validation)
    - Password input
    - Role selection (ADMIN, AGENT, WRITER)
  - **User Editing**:
    - Update name
    - Update email
    - Update role
    - Cannot change password (use reset password)

### Listing Management
- **Location**: `/admin/listings`
- **Features**:
  - View all listings (published and pending)
  - Filter by status
  - View toggle (grid/list)
  - **Actions**:
    - Approve listing
    - Delete listing
    - Edit listing
    - View listing details
  - **Approval Process**:
    - One-click approval
    - Records approver and timestamp
    - Updates `isPublished` to true
    - Activity logging

### Blog Management
- **Location**: `/admin/blogs`
- **Features**:
  - View all blogs (published and pending)
  - Filter by status
  - View toggle (grid/list)
  - **Actions**:
    - Approve blog
    - Delete blog
    - Edit blog
    - View blog details
  - **Approval Process**:
    - One-click approval
    - Records approver and timestamp
    - Updates `isPublished` to true
    - Activity logging

### Activity Logs
- **Location**: `/admin/logs`
- **Features**:
  - View all system activities
  - Filter by:
    - User
    - Action type
    - Item type
    - Date range
  - **Activity Information**:
    - User (name and email)
    - Action (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, APPROVE, REJECT)
    - Item Type (LISTING, BLOG, USER, AUTH)
    - Item ID
    - Metadata (title, etc.)
    - IP Address
    - User Agent
    - Timestamp
  - **Export** (future feature)

### Admin Layout
- **Sidebar Navigation**:
  - Dashboard
  - Users
  - Listings
  - Blogs
  - Activity Logs
  - Back to Dashboard (user dashboard)
  - Logout
- **Responsive Design**:
  - Desktop: Fixed sidebar
  - Mobile: Collapsible sidebar
  - Hamburger menu on mobile

---

## User Dashboard Features

### Dashboard Home
- **Location**: `/dashboard`
- **Welcome Message**: Personalized greeting
- **Statistics Cards**:
  - My Listings (with link)
  - My Blogs (with link)
  - Published (listings + blogs)
  - Pending Approval (listings + blogs)
- **Quick Actions**:
  - Manage Listings card
  - Manage Blogs card
- **Recent Activity**:
  - Last 10 user activities
  - Color-coded action badges
  - Item type and ID
  - Timestamp
  - Metadata (title) display

### Listings Management
- **Location**: `/dashboard/listings`
- **Features**:
  - View all own listings
  - Filter by status (All/Published/Pending)
  - Create new listing button
  - **Listing Cards**:
    - Cover image
    - Title
    - Location
    - Price
    - Status badge (Published/Pending)
    - Property type
    - Quick stats (bedrooms, bathrooms, size)
    - Actions (Edit/Delete)
  - **Actions**:
    - Create new listing
    - Edit listing
    - Delete listing (with confirmation)
    - View listing (public page)

### Blog Management
- **Location**: `/dashboard/blogs`
- **Features**:
  - View all own blogs
  - Filter by status (All/Published/Pending)
  - Create new blog button
  - **Blog Cards**:
    - Cover image
    - Title
    - Excerpt
    - Status badge (Published/Pending)
    - Created date
    - Actions (Edit/Delete)
  - **Actions**:
    - Create new blog
    - Edit blog
    - Delete blog (with confirmation)
    - View blog (public page)

### Activity Log
- **Location**: `/dashboard/activity`
- **Features**:
  - View own activity history
  - Filter by action type
  - Filter by item type
  - Date-based filtering
  - **Activity Details**:
    - Action type
    - Item type
    - Item ID
    - Metadata
    - Timestamp
    - IP address (if available)

### Settings
- **Location**: `/dashboard/settings`
- **Features**:
  - Change password form
  - Current password input (with visibility toggle)
  - New password input (with visibility toggle)
  - Confirm password input (with visibility toggle)
  - Password requirements display
  - Success/error messages
  - Form validation

### Dashboard Layout
- **Sidebar Navigation**:
  - Dashboard
  - Listings
  - Blogs
  - Activity
  - Settings
  - Logout
- **Responsive Design**:
  - Desktop: Fixed sidebar
  - Mobile: Collapsible sidebar
  - Hamburger menu on mobile

---

## Public Features

### Homepage
- **Location**: `/`
- **Hero Section**:
  - Large headline: "Real Estate Solutions. Made Even Easier."
  - Subheadline with service description
  - Call-to-action buttons:
    - View Properties
    - Contact Us
  - Background image (hero-condo.jpg)
  - Gradient overlay
- **Featured Listings Section**:
  - Displays latest published listings
  - Property cards with images
  - Quick view information
  - Link to full listing
- **Services Section** (future feature)
- **About Section** (future feature)

### Listings Page
- **Location**: `/listings`
- **Features**:
  - All published listings display
  - **Filters**:
    - Listing type (Sale/Rent)
    - Property type
    - Price range (min/max)
    - Bedrooms (min)
    - Bathrooms (min)
    - City
  - **Sorting**:
    - Price: Low to High
    - Price: High to Low
    - Date: Newest First
    - Date: Oldest First
  - **View Toggle**:
    - Grid view
    - List view
  - **Search**: Search by title, location, city
  - **Pagination**: Page-based navigation
  - **Listing Cards**:
    - Cover image
    - Title
    - Location
    - Price
    - Listing type badge
    - Property type
    - Quick stats (bedrooms, bathrooms, size)
    - View details link

### Listing Detail Page
- **Location**: `/listings/[id]`
- **Features**:
  - **Image Gallery**:
    - Main image display
    - Thumbnail navigation
    - Image zoom modal
    - Keyboard navigation (arrow keys, ESC)
    - Image counter
    - Full-screen carousel
  - **Property Information**:
    - Title
    - Price (with listing type badge)
    - Location (with map pin icon)
    - Quick stats (bedrooms, bathrooms, size, property ID)
    - Property type badge
    - Description
    - Property details (year built, floor, parking, status)
    - Amenities (with icons, categorized)
  - **Contact Sidebar**:
    - Agent contact information
    - Phone number (clickable)
    - Email (clickable)
    - Schedule Tour button
    - Request Information button
      - Confirmation modal
      - Pre-fills contact form
  - **Quick Facts**:
    - Price per sqm (if available)
    - Property type
    - City
    - Status
  - **Map Section** (placeholder for future integration)
  - **Breadcrumb Navigation**
  - **Back to Listings** button

### Blog Page
- **Location**: `/blog`
- **Features**:
  - All published blogs display
  - Grid layout (3 columns on desktop)
  - **Blog Cards**:
    - Cover image
    - Title
    - Excerpt
    - Author name
    - Publication date
    - Read more link
  - **Empty State**: Message when no blogs available

### Blog Detail Page
- **Location**: `/blog/[slug]`
- **Features**:
  - Full blog post display
  - Cover image
  - Title
  - Author information
  - Publication date
  - Content (formatted text)
  - Image gallery (if multiple images)
  - Related posts (future feature)
  - Social sharing (future feature)

### Contact Page
- **Location**: `/contact`
- **Features**:
  - **Contact Information Sidebar**:
    - Phone: +63 921 2303011
    - Email: thespecialistrss@gmail.com
    - Address: Las Pinas City
    - Business Hours: Monday - Saturday, 9:00 AM - 6:00 PM
    - **Services Quick Links**:
      - Property Buying Assistance
      - Property Selling & Marketing
      - Leasing & Rental Services
      - Documentation & Title Transfer
      - Property Valuation
      - Real Estate Advisory
  - **Contact Form**:
    - Full Name (required)
    - Email (required)
    - Phone (required)
    - Interest dropdown (required):
      - Buying
      - Selling
      - Renting
      - Documentation (Transfer of Title, Tax Dec, Etc)
      - Schedule Tour
      - Other
    - Message (required)
    - Consent checkbox (required)
    - reCAPTCHA v3 verification
    - Submit button
  - **Form Features**:
    - URL parameter pre-filling (interest, message)
    - Service button auto-fill
    - Auto-scroll to message field
    - Success/error messages
    - Form reset after success
    - EmailJS integration
    - reCAPTCHA spam protection

### Navigation
- **Navbar** (all pages):
  - Logo (Sora font)
  - Navigation links:
    - Home
    - Listings
    - Blog
    - Contact
  - Login button (if not authenticated)
  - Dashboard link (if authenticated)
  - Admin link (if admin)
  - Logout button (if authenticated)
  - Responsive mobile menu

---

## Image Upload & Processing

### Upload System
- **Endpoint**: `/api/upload`
- **Authentication**: Required (authenticated users only)
- **Method**: POST (multipart/form-data)

### Image Processing
- **Library**: Sharp
- **Target Dimensions**: 2000 x 1500 pixels (4:3 aspect ratio)
- **Resizing Logic**:
  - Only resizes if image exceeds target dimensions
  - Maintains aspect ratio
  - Fits within 2000x1500 bounds
  - No upscaling (smaller images kept original size)
- **Optimization**:
  - JPEG format conversion
  - Quality: 85%
  - mozjpeg optimization
  - Automatic format detection

### File Validation
- **File Type**: Images only (image/*)
- **File Size**: Maximum 20MB
- **Validation**: Server-side and client-side

### Storage
- **Location**: `/public/uploads/listings/`
- **Naming**: `listing-{timestamp}-{randomString}.jpg`
- **Public Access**: Images served as static files
- **Directory Creation**: Automatic if not exists

### Upload Features
- **Drag-and-Drop**: Supported
- **Click to Upload**: Supported
- **Multiple Files**: Supported (sequential upload)
- **Progress Indication**: Loading states per image
- **Error Handling**: Per-file error messages
- **Image Preview**: Immediate preview after upload
- **Image Removal**: Remove uploaded images
- **Cover Photo Selection**: Designate primary image

### Image Limits
- **Listings**: Unlimited (practical limit based on performance)
- **Blogs**: Maximum 5 images per blog post

### Image Display
- **Next.js Image Component**: Optimized image loading
- **Lazy Loading**: Automatic lazy loading
- **Responsive Images**: Srcset and sizes attributes
- **Image Zoom**: Full-screen zoom modal
- **Thumbnail Gallery**: Thumbnail navigation
- **Image Carousel**: Keyboard and click navigation

---

## Contact Form & Communication

### Contact Form
- **Location**: `/contact`
- **Integration**: EmailJS
- **Spam Protection**: Google reCAPTCHA v3

### Form Fields
1. **Full Name** (required)
2. **Email** (required, email validation)
3. **Phone** (required)
4. **Interest** (required, dropdown):
   - Buying
   - Selling
   - Renting
   - Documentation (Transfer of Title, Tax Dec, Etc)
   - Schedule Tour
   - Other
5. **Message** (required, textarea)
6. **Consent Checkbox** (required)

### Form Features
- **URL Parameter Pre-filling**:
  - `?interest=buying` - Pre-fills interest
  - `?message=...` - Pre-fills message
  - Auto-scrolls to message field
- **Service Button Integration**:
  - Clicking service buttons pre-fills form
  - Auto-scrolls to message field
- **Request Information Integration**:
  - From listing detail page
  - Pre-fills interest (buying/renting based on listing)
  - Pre-fills message with property details
  - Includes property link
- **Validation**:
  - Client-side validation
  - Required fields
  - Email format validation
- **Success/Error Handling**:
  - Success message display
  - Error message display
  - Form reset after success (3 seconds)
- **Loading States**: Submit button loading indicator

### reCAPTCHA Integration
- **Version**: reCAPTCHA v3
- **Implementation**:
  - Dynamic script loading
  - Token generation on form submit
  - Server-side verification
  - Action: "contact_form"
- **Error Handling**: Graceful fallback if reCAPTCHA fails

### EmailJS Integration
- **Service**: EmailJS Browser SDK
- **Template**: Custom HTML template
- **Template Variables**:
  - `from_name`: Full name
  - `from_email`: Email
  - `phone`: Phone number
  - `interest`: Interest selection
  - `message`: Message content
  - `to_email`: Recipient email (thespecialistrss@gmail.com)
- **Error Handling**: User-friendly error messages

### Contact Information Display
- **Phone**: +63 921 2303011 (clickable tel: link)
- **Email**: thespecialistrss@gmail.com (clickable mailto: link)
- **Address**: Las Pinas City
- **Business Hours**: Monday - Saturday, 9:00 AM - 6:00 PM

---

## Activity Logging System

### Logging Infrastructure
- **Database Model**: Activity table
- **Automatic Logging**: All user actions logged
- **Non-blocking**: Logging doesn't affect main operations
- **Error Handling**: Logging errors don't break functionality

### Logged Actions

#### Authentication Actions
- **LOGIN**: User login events
- **LOGOUT**: User logout events

#### Content Actions
- **CREATE**: Creating listings or blogs
- **UPDATE**: Updating listings or blogs
- **DELETE**: Deleting listings or blogs
- **APPROVE**: Admin approving content
- **REJECT**: Admin rejecting content (via delete)

#### User Management Actions
- **CREATE**: Creating new users
- **UPDATE**: Updating user information
- **DELETE**: Deleting users
- **Password Reset**: Admin-initiated password resets

### Activity Data
- **User ID**: Who performed the action
- **Action**: Type of action (enum)
- **Item Type**: LISTING, BLOG, USER, AUTH
- **Item ID**: ID of affected item (if applicable)
- **Metadata**: JSON object with additional info
  - Title (for listings/blogs)
  - Uploader information
  - Approver information
  - Other relevant data
- **IP Address**: User's IP address
- **User Agent**: Browser/user agent string
- **Timestamp**: When action occurred

### Activity Views

#### Admin Activity Logs
- **Location**: `/admin/logs`
- **Features**:
  - View all system activities
  - Filter by user, action, item type
  - See all user information
  - Full metadata display

#### User Activity Logs
- **Location**: `/dashboard/activity`
- **Features**:
  - View own activities only
  - Filter by action, item type
  - Personal activity history

#### Dashboard Activity Widget
- **Location**: `/dashboard` and `/admin/dashboard`
- **Features**:
  - Recent 10 activities
  - Color-coded action badges
  - Quick overview

### Activity Logging Functions
- `logActivity()`: Generic activity logger
- `logAuthActivity()`: Authentication-specific logger
- `logListingActivity()`: Listing-specific logger (with enriched metadata)
- `logBlogActivity()`: Blog-specific logger (with enriched metadata)
- `logUserActivity()`: User management logger

---

## Security Features

### Authentication Security
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure session tokens
- **Session Validation**: Server-side session checks
- **Password Requirements**: Minimum 8 characters
- **Password Visibility Toggle**: Secure password input

### Route Protection
- **Middleware**: Next.js middleware for route protection
- **Role-based Access**: Admin routes protected
- **Authentication Checks**: Dashboard routes protected
- **403 Page**: Unauthorized access handling
- **Automatic Redirects**: Login redirect for unauthenticated users

### Input Validation
- **Client-side Validation**: Form validation
- **Server-side Validation**: API endpoint validation
- **File Type Validation**: Image files only
- **File Size Limits**: 20MB maximum
- **Email Validation**: Format validation
- **Required Fields**: Server-side enforcement

### Spam Protection
- **reCAPTCHA v3**: Google reCAPTCHA integration
- **Server-side Verification**: Token verification
- **Action-based Scoring**: Different actions tracked

### Data Security
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Prevention**: React automatic escaping
- **CSRF Protection**: NextAuth built-in protection
- **Environment Variables**: Sensitive data in env vars

### Content Security
- **Approval Workflow**: Content requires admin approval
- **Ownership Validation**: Users can only edit own content
- **Admin Override**: Admins can edit/delete any content
- **Cascade Deletes**: User deletion cascades to content

---

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth handler
  - Login
  - Logout
  - Session management

### Listings
- `GET /api/listings` - Get all listings
  - Query params: `published=true/false` (default: true for public)
  - Returns: Array of listings
- `POST /api/listings` - Create listing
  - Auth: Required
  - Body: Listing data
  - Returns: Created listing
- `GET /api/listings/[id]` - Get single listing
  - Returns: Listing with user info
- `PUT /api/listings/[id]` - Update listing
  - Auth: Required (owner or admin)
  - Body: Updated listing data
  - Returns: Updated listing
- `POST /api/listings/[id]/delete` - Delete listing
  - Auth: Required (owner only)
  - Returns: Success message

### Admin Listings
- `POST /api/admin/listings/[id]/approve` - Approve listing
  - Auth: Required (admin only)
  - Returns: Approved listing
- `POST /api/admin/listings/[id]/delete` - Delete any listing
  - Auth: Required (admin only)
  - Returns: Success message

### Blog Posts
- `GET /api/blog-posts` - Get all blog posts
  - Query params: `published=true/false` (default: true for public)
  - Returns: Array of blog posts
- `POST /api/blog-posts` - Create blog post
  - Auth: Required
  - Body: Blog post data
  - Returns: Created blog post
- `GET /api/blog-posts/[id]` - Get single blog post
  - Returns: Blog post with user info
- `GET /api/blog-posts/slug/[slug]` - Get blog post by slug
  - Returns: Blog post with user info
- `PUT /api/blog-posts/[id]` - Update blog post
  - Auth: Required (owner or admin)
  - Body: Updated blog post data
  - Returns: Updated blog post
- `POST /api/blogs/[id]/delete` - Delete blog post
  - Auth: Required (owner only)
  - Returns: Success message

### Admin Blogs
- `POST /api/admin/blogs/[id]/approve` - Approve blog post
  - Auth: Required (admin only)
  - Returns: Approved blog post
- `POST /api/admin/blogs/[id]/delete` - Delete any blog post
  - Auth: Required (admin only)
  - Returns: Success message

### Users
- `GET /api/admin/users` - Get all users
  - Auth: Required (admin only)
  - Returns: Array of users with counts
- `POST /api/admin/users` - Create user
  - Auth: Required (admin only)
  - Body: User data
  - Returns: Created user
- `GET /api/admin/users/[id]` - Get single user
  - Auth: Required (admin only)
  - Returns: User data
- `PUT /api/admin/users/[id]` - Update user
  - Auth: Required (admin only)
  - Body: Updated user data
  - Returns: Updated user
- `POST /api/admin/users/[id]/delete` - Delete user
  - Auth: Required (admin only, cannot delete self)
  - Returns: Success message
- `POST /api/admin/users/[id]/reset-password` - Reset user password
  - Auth: Required (admin only)
  - Body: New password
  - Returns: Success message

### User Settings
- `POST /api/user/change-password` - Change own password
  - Auth: Required
  - Body: Current password, new password, confirm password
  - Returns: Success message

### File Upload
- `POST /api/upload` - Upload image
  - Auth: Required
  - Body: multipart/form-data with file
  - Returns: Image URL and metadata

### reCAPTCHA
- `POST /api/verify-recaptcha` - Verify reCAPTCHA token
  - Body: Token
  - Returns: Verification result

---

## Database Schema

### User Model
```prisma
model User {
  id                String     @id @default(cuid())
  email             String     @unique
  name              String
  password          String
  role              UserRole   @default(AGENT)
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
  activities        Activity[]
  approvedBlogPosts BlogPost[] @relation("ApprovedBlogPosts")
  blogPosts         BlogPost[]
  approvedListings  Listing[]  @relation("ApprovedListings")
  listings          Listing[]
}
```

### Listing Model
```prisma
model Listing {
  id           String    @id @default(cuid())
  title        String
  description  String
  price        Float?
  location     String
  city         String?
  bedrooms     Int?
  bathrooms    Int?
  size         Float?
  propertyType String?
  listingType  String?
  images       String[]
  address      String?
  yearBuilt    Int?
  parking      Int?
  floor        Int?
  totalFloors  Int?
  amenities    Json?
  propertyId   String?
  available    Boolean   @default(true)
  userId       String
  approvedBy   String?
  approvedAt   DateTime?
  isPublished  Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  approver     User?     @relation("ApprovedListings", fields: [approvedBy], references: [id])
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isPublished])
}
```

### BlogPost Model
```prisma
model BlogPost {
  id            String   @id @default(cuid())
  title         String
  content       String   @db.Text
  slug          String   @unique
  excerpt       String?  @db.Text
  images        String[]
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  approvedBy    String?
  approvedAt    DateTime?
  isPublished   Boolean  @default(false)
  approver      User?    @relation("ApprovedBlogPosts", fields: [approvedBy], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([slug])
  @@index([isPublished])
}
```

### Activity Model
```prisma
model Activity {
  id        String           @id @default(cuid())
  userId    String
  action    ActivityAction
  itemType  ActivityItemType
  itemId    String?
  metadata  Json?
  ipAddress String?
  userAgent String?
  timestamp DateTime         @default(now())
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([timestamp])
  @@index([itemType, itemId])
}
```

### Enums
```prisma
enum UserRole {
  ADMIN
  AGENT
  WRITER
}

enum ActivityAction {
  LOGIN
  LOGOUT
  CREATE
  UPDATE
  DELETE
  APPROVE
  REJECT
}

enum ActivityItemType {
  LISTING
  BLOG
  USER
  AUTH
}
```

### Relationships
- User → Listings (one-to-many)
- User → BlogPosts (one-to-many)
- User → Activities (one-to-many)
- User → ApprovedListings (one-to-many, via approver)
- User → ApprovedBlogPosts (one-to-many, via approver)
- Listing → User (many-to-one, creator)
- Listing → User (many-to-one, approver, optional)
- BlogPost → User (many-to-one, creator)
- BlogPost → User (many-to-one, approver, optional)
- Activity → User (many-to-one)

### Indexes
- User: email (unique)
- Listing: userId, isPublished
- BlogPost: userId, slug (unique), isPublished
- Activity: userId, timestamp, [itemType, itemId]

---

## UI/UX Features

### Design System

#### Color Palette
- **Background**: White (#FFFFFF)
- **Primary Text**: Luxury Charcoal (#111111)
- **CTA Button**: Dark Slate (#1F2937)
- **CTA Hover**: Slightly Darker Slate (#1A232E)
- **Border**: Ultra-light Gray (#E5E7EB)
- **Accent**: Gold (#D4AF37) for rent badges
- **Success**: Green shades
- **Error**: Red shades
- **Warning**: Yellow shades
- **Info**: Blue shades

#### Typography
- **Primary Font**: Geist Sans (body & navigation)
- **Brand Font**: Sora (logo)
- **Font Sizes**: Responsive scale
- **Font Weights**: Regular, Medium, Semibold

#### Spacing
- **Consistent Padding**: 4, 6, 8 units
- **Grid Gaps**: 4, 6, 8 units
- **Border Radius**: Rounded corners (md, lg, xl)

### Component Features

#### Buttons
- **Primary**: Gradient background (dark slate)
- **Secondary**: Border with hover fill
- **Danger**: Red variants
- **Loading States**: Spinner indicators
- **Disabled States**: Opacity and cursor changes
- **Hover Effects**: Transform and shadow

#### Forms
- **Input Fields**: Border, focus ring, shadow
- **Validation**: Error messages, success states
- **Labels**: Required field indicators
- **Placeholders**: Helpful placeholder text
- **Password Fields**: Visibility toggle

#### Cards
- **Shadow**: Subtle shadow with hover elevation
- **Border**: Light border
- **Hover Effects**: Shadow increase, transform
- **Responsive**: Adapts to screen size

#### Modals
- **Backdrop**: Dark overlay
- **Centered**: Modal centering
- **Close Button**: X button
- **Keyboard Support**: ESC to close
- **Focus Trap**: Accessibility

#### Navigation
- **Navbar**: Fixed top navigation
- **Sidebar**: Collapsible sidebar (admin/dashboard)
- **Mobile Menu**: Hamburger menu
- **Active States**: Highlighted current page
- **Breadcrumbs**: Path navigation

#### Image Galleries
- **Main Image**: Large display
- **Thumbnails**: Grid of thumbnails
- **Zoom Modal**: Full-screen image view
- **Navigation**: Arrow keys, click navigation
- **Counter**: Image count display
- **Loading States**: Skeleton loaders

#### Lists & Tables
- **Responsive Tables**: Horizontal scroll on mobile
- **Hover States**: Row highlighting
- **Sorting**: Sortable columns
- **Filtering**: Filter controls
- **Pagination**: Page navigation

### Responsive Design

#### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

#### Mobile Optimizations
- **Collapsible Sidebars**: Mobile menu
- **Stacked Layouts**: Vertical stacking
- **Touch-friendly**: Larger tap targets
- **Responsive Images**: Optimized sizes
- **Mobile Navigation**: Bottom navigation (future)

#### Tablet Optimizations
- **Grid Adjustments**: 2-column layouts
- **Sidebar Behavior**: Collapsible
- **Touch Interactions**: Swipe gestures

#### Desktop Optimizations
- **Multi-column Layouts**: 3-4 columns
- **Fixed Sidebars**: Always visible
- **Hover Effects**: Enhanced interactions
- **Keyboard Navigation**: Full keyboard support

### Accessibility Features
- **Semantic HTML**: Proper HTML elements
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Visible focus states
- **Color Contrast**: WCAG compliant
- **Alt Text**: Image alt attributes
- **Form Labels**: Associated labels

### Animation & Transitions
- **Smooth Transitions**: 300ms transitions
- **Hover Effects**: Transform and shadow
- **Loading Animations**: Spinner animations
- **Page Transitions**: Smooth navigation
- **Scroll Animations**: Fade-in on scroll (future)

### Loading States
- **Skeleton Loaders**: Content placeholders
- **Spinner Indicators**: Loading spinners
- **Progress Bars**: Upload progress (future)
- **Suspense Boundaries**: React Suspense

### Error Handling
- **Error Messages**: User-friendly messages
- **Error Boundaries**: React error boundaries
- **404 Pages**: Not found handling
- **403 Pages**: Unauthorized handling
- **500 Pages**: Server error handling (future)

---

## Performance Optimizations

### Image Optimization
- **Next.js Image Component**: Automatic optimization
- **Sharp Processing**: Server-side optimization
- **Lazy Loading**: Automatic lazy loading
- **Responsive Images**: Srcset and sizes
- **Format Conversion**: JPEG optimization
- **Size Limits**: 2000x1500 max dimensions

### Code Optimization
- **Code Splitting**: Automatic code splitting
- **Tree Shaking**: Unused code elimination
- **Minification**: Production minification
- **Bundle Analysis**: Bundle size monitoring

### Database Optimization
- **Indexes**: Strategic database indexes
- **Query Optimization**: Efficient queries
- **Connection Pooling**: Database connection pooling
- **Selective Fields**: Only fetch needed fields

### Caching
- **Static Generation**: Pre-rendered pages
- **ISR**: Incremental Static Regeneration (future)
- **API Caching**: Response caching (future)
- **Browser Caching**: Cache headers (future)

### Loading Performance
- **Suspense**: React Suspense for async
- **Streaming**: Server-side streaming
- **Prefetching**: Link prefetching
- **Optimistic Updates**: UI updates before confirmation

---

## Environment Variables

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Application URL

### Optional Variables
- `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` - EmailJS public key
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID` - EmailJS service ID
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` - EmailJS template ID
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - reCAPTCHA site key
- `RECAPTCHA_SECRET_KEY` - reCAPTCHA secret key
- `NODE_ENV` - Environment (development/production)

---

## Deployment

### Platform
- **Hosting**: Netlify
- **Plugin**: @netlify/plugin-nextjs
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`

### Database
- **Provider**: PostgreSQL (Neon or similar)
- **Migrations**: Prisma Migrate
- **Seeding**: Prisma seed script

### Build Process
- **Post-install Script**: Database setup
- **Build Simulation**: Netlify build simulation script
- **Environment Setup**: Environment variable configuration

---

## Future Enhancements (Planned)

### Features
- Map integration (Google Maps/Mapbox)
- Advanced search filters
- Saved properties (favorites)
- Property comparison
- Email notifications
- SMS notifications
- Property inquiry management
- Analytics dashboard
- SEO optimization
- Social media integration
- Multi-language support
- Payment integration
- Virtual tour integration
- Advanced reporting
- Export functionality (CSV, PDF)
- Bulk operations
- Image CDN integration
- Advanced caching
- Search indexing
- Real-time updates

### Technical Improvements
- Incremental Static Regeneration (ISR)
- API response caching
- Image CDN (Cloudinary/AWS S3)
- Search indexing (Algolia/Elasticsearch)
- Real-time features (WebSockets)
- Advanced analytics
- Performance monitoring
- Error tracking (Sentry)
- A/B testing
- Progressive Web App (PWA)

---

## Support & Documentation

### Documentation Files
- `README.md` - Basic project information
- `SETUP.md` - Setup instructions
- `QUICK_START.md` - Quick start guide
- `DATABASE_SETUP.md` - Database setup
- `TROUBLESHOOTING.md` - Common issues and solutions
- `PERFORMANCE_OPTIMIZATIONS.md` - Performance tips
- `SYSTEM_FEATURES.md` - This file (complete feature documentation)

### Getting Help
- Check documentation files
- Review error messages
- Check activity logs
- Contact system administrator

---

**Last Updated**: January 2025
**Version**: 0.1.0
**Maintained By**: The Specialist Realty Development Team

