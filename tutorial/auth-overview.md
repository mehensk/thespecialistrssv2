# Auth Flow Overview (JWT + Cookie Session)

This is the standard auth pattern your app follows:

`authenticate -> issue signed token -> store securely -> validate on protected requests -> enforce expiry/inactivity -> clear session on logout`

---

## 1) Authenticate

User submits credentials (email/password).  
Server verifies them against trusted data (usually database + password hash check).

If valid:
- User is considered authenticated.

If invalid:
- Login fails, no session is created.

---

## 2) Issue Signed Token

After successful login, server creates a signed JWT.

Typical token contents:
- `userId`
- `role` (ex: admin/user)
- `iat` (issued-at time)
- optional activity/session metadata

Why sign it:
- Signature proves token was created by your server.
- If payload is modified by attacker, signature check fails.

---

## 3) Store Securely (Cookie)

Token is stored in a cookie, commonly:
- `HttpOnly` (JavaScript cannot read it directly)
- `SameSite` (helps reduce CSRF risk)
- `Secure` on HTTPS

Why cookie storage:
- Browser automatically includes it on requests.
- Server can check auth state without re-login each page.

---

## 4) Validate on Protected Requests

Before allowing access to protected pages/APIs:
- Read token from cookie.
- Verify signature with server secret.
- Confirm required claims exist (like `userId`).
- Check role/permissions when needed.

If token is missing/invalid:
- Reject request or redirect to login/home.

---

## 5) Enforce Expiry and Inactivity

Two common controls:

1. Max session age  
- Hard upper limit (example: 24 hours).

2. Inactivity timeout  
- Logout if user inactive too long (example: 10 minutes).

Why both:
- Max age limits long-lived sessions.
- Inactivity timeout protects unattended sessions.

---

## 6) Clear Session on Logout

On logout:
- Invalidate/remove auth cookies server-side.
- Clean client auth state.
- Redirect user to public page.

For multi-tab behavior:
- Broadcast logout so all tabs exit session.

---

## Why This Pattern Is Best Practice

- Security: signed, verifiable identity data.
- Scalability: stateless JWT checks are efficient.
- UX: users stay logged in across page loads.
- Control: expiry + inactivity reduce risk window.

---

## Common Failure Modes

- Cookie not cleared properly -> user appears still logged in.
- Expiry not checked consistently -> stale sessions survive.
- Wrong cookie flags in local/dev (`Secure` on HTTP localhost) -> login seems broken.
- Hybrid fallback logic allows access when token/session checks fail.

---

## Quick Mental Model

Think of it like a secured access badge:
- Login = identity check.
- JWT = badge data.
- Signature = anti-forgery seal.
- Cookie = where badge is carried.
- Middleware/server checks = security guard at the door.
- Logout/expiry = badge revoked.

