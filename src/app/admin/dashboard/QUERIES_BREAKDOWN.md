# Dashboard Queries Breakdown

## Current 13 Queries:

### System Stats (5 queries):
1. `prisma.user.count()` - Total Users
2. `prisma.listing.count()` - Total Listings  
3. `prisma.blogPost.count()` - Total Blogs
4. `prisma.listing.count({ where: { isPublished: false } })` - Pending Listings
5. `prisma.blogPost.count({ where: { isPublished: false } })` - Pending Blogs

### Personal Stats (6 queries):
6. `prisma.listing.count({ where: { userId: user.id } })` - My Listings
7. `prisma.blogPost.count({ where: { userId: user.id } })` - My Blogs
8. `prisma.listing.count({ where: { userId: user.id, isPublished: true } })` - My Published Listings
9. `prisma.blogPost.count({ where: { userId: user.id, isPublished: true } })` - My Published Blogs
10. `prisma.listing.count({ where: { userId: user.id, isPublished: false } })` - My Pending Listings
11. `prisma.blogPost.count({ where: { userId: user.id, isPublished: false } })` - My Pending Blogs

### Activity (2 queries):
12. `prisma.activity.findMany()` - System Activity (with user join - SLOW)
13. `prisma.activity.findMany({ where: { userId: user.id } })` - My Activity (with user join - SLOW)

## Optimization Opportunities:

### Redundant Calculations:
- **My Published Listings** = My Listings - My Pending Listings (can calculate, no query needed)
- **My Published Blogs** = My Blogs - My Pending Blogs (can calculate, no query needed)

### Can Reduce From 11 to 7 Stats Queries:
- Keep: Total Users, Total Listings, Total Blogs, Pending Listings, Pending Blogs
- Keep: My Listings, My Blogs, My Pending Listings, My Pending Blogs
- **Remove**: My Published Listings, My Published Blogs (calculate instead)

### Activity Queries:
- These are the slowest (have joins)
- Can be deferred or made optional
- Not critical for initial page load

## Recommended: Load Only Essential Stats First
- Essential: Total Users, Total Listings, Total Blogs, Pending Approvals
- Personal: My Listings, My Blogs (can calculate published/pending later)
- Defer: Activity logs (load on scroll or button click)

