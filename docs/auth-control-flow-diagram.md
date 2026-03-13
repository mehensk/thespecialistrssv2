# Admin Auth Control Flow Diagrams

This file breaks the auth flow into separate, readable diagrams:
- Admin login flow
- Admin logout flow
- Why session can survive server restart

---

## 1) Admin Login Flow

```mermaid
flowchart TD
    A[User opens /login] --> B[Submit email + password]
    B --> C[Client calls signIn credentials]
    C --> D{Credentials valid in authorize?}

    D -- No --> E[Return null]
    E --> F[UI shows Invalid email or password]

    D -- Yes --> G[Create JWT token]
    G --> H[Set token fields: id role iat lastActivity serverStartTime]
    H --> I[Auth cookie stored in browser]

    I --> J[Client retries getSession until user.role exists]
    J --> K{Role is ADMIN?}
    K -- Yes --> L[Redirect to /admin/dashboard]
    K -- No --> M[Redirect to /dashboard]

    L --> N[Request hits middleware]
    M --> N
    N --> O{Token exists?}
    O -- No --> P[Redirect to /]
    O -- Yes --> Q{Token passes validation?}
    Q -- No --> R[Delete auth cookies and redirect /]
    Q -- Yes --> S[Allow route]
```

Light code anchors:
- `src/app/login/page.tsx`
- `src/lib/auth.ts`
- `src/middleware.ts`

---

## 2) Admin Logout Flow

```mermaid
flowchart TD
    A[User clicks Logout in Navbar/AdminLayout] --> B[Set localStorage auth-logout-flag=true]
    B --> C[Broadcast logout to other tabs]
    C --> D[POST /api/auth/logout]

    D --> E[Server clears HttpOnly auth cookies]
    E --> F[Client calls signOut redirect false]
    F --> G[Redirect to /?logout=success]

    C --> H[Other tabs receive logout signal]
    H --> I[Other tabs also call /api/auth/logout + signOut]
    I --> G
```

Light code anchors:
- `src/components/ui/navbar.tsx`
- `src/components/admin/AdminLayout.tsx`
- `src/components/dashboard/DashboardLayout.tsx`
- `src/components/providers/LogoutSync.tsx`
- `src/app/api/auth/logout/route.ts`

---

## 3) Why You Stay Logged In After Server Restart

```mermaid
flowchart TD
    A[User already has valid JWT cookie] --> B[Server restarts]
    B --> C[User opens protected route]
    C --> D[Middleware validates token]
    D --> E{Restart invalidation enabled?}

    E -- Production --> F[No restart invalidation check]
    F --> G[Token still valid by iat + lastActivity]
    G --> H[User remains logged in]

    E -- Non-production and non-serverless --> I[hasServerRestarted check runs]
    I --> J{token.serverStartTime older than current start?}
    J -- Yes --> K[Invalidate token and redirect]
    J -- No --> L[Allow]
```

Current behavior in your code:
- Restart-based forced logout is disabled in production.
- Session validity depends on:
  - max age (24h)
  - inactivity timeout (10m, refreshed by activity updates)

Key files:
- `src/lib/auth.ts`
- `src/middleware.ts`
- `src/lib/server-start-time.ts`

---

## Plain-Language Summary

- Login succeeds -> JWT cookie is created -> middleware allows protected routes while token is valid.
- Logout works by clearing cookies server-side and syncing logout across tabs.
- Server restart does **not** currently force logout in production, so existing JWT cookies can continue to work until timeout rules expire.
