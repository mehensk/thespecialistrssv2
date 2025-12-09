# Authentication Refactor - Decision Questions

## Overview

This document asks questions to help determine the best approach for refactoring the authentication system to fix all login/logout issues. Please answer each question so we can implement the solution that works best for your needs.

---

## 1. Session Management Strategy

### Question 1.1: How long should sessions last?

**Current:** 24 hours max age, 10 minutes inactivity timeout

**Options:**
- [x ] **A)** Keep current (24 hours max, 10 min inactivity)
- [ ] **B)** Longer sessions (7 days max, 30 min inactivity) - better UX, less secure
- [ ] **C)** Shorter sessions (1 hour max, 5 min inactivity) - more secure, worse UX
- [ ] **D)** Custom: Max age: _____ hours, Inactivity: _____ minutes

**Your choice:** _____

**Notes:** Longer sessions = users stay logged in longer but less secure. Shorter = more secure but users get logged out more often.

---

### Question 1.2: How should we handle inactivity timeout?

**Current:** ActivityTracker tries to keep session alive, but can fail

**Options:**
- [x ] **A)** Keep ActivityTracker but add retry logic (if update fails, retry 3 times)
- [ ] **B)** Remove inactivity timeout entirely (only use max age)
- [ ] **C)** Make inactivity timeout longer (30 minutes instead of 10)
- [ ] **D)** Show warning before timeout ("You'll be logged out in 1 minute due to inactivity")

**Your choice:** _____

---

## 2. Logout Behavior

### Question 2.1: How should logout work?

**Current:** Tries to clear cookies client-side (doesn't work for HttpOnly cookies)

**Options:**
- [x ] **A)** Create server-side logout endpoint that properly clears cookies
- [ ] **B)** Use NextAuth's built-in signOut() and trust it works
- [ ] **C)** Hybrid: Call server endpoint + client-side cleanup
- [ ] **D)** Add logout flag in localStorage to prevent auto-refetch

**Your choice:** _____

**Recommendation:** Option A (server-side endpoint) is most reliable for HttpOnly cookies.

---

### Question 2.2: What should happen after logout?

**Current:** Redirects to home, but SessionProvider might restore session

**Options:**
- [ ] **A)** Redirect to home and disable SessionProvider refetch for 5 minutes
- [ ] **B)** Redirect to login page (clearer that user is logged out)
- [x ] **C)** Redirect to home and show "You've been logged out" message
- [ ] **D)** Stay on current page but show logged-out state

**Your choice:** _____

---

## 3. SessionProvider Auto-Refetch

### Question 3.1: Should we keep auto-refetch?

**Current:** Refetches every 2 minutes and on window focus

**Problem:** This restores sessions even after logout if cookies persist

**Options:**
- [ ] **A)** Disable `refetchOnWindowFocus` (only refetch on interval)
- [ ] **B)** Disable `refetchInterval` (only refetch on window focus)
- [x ] **C)** Keep both but add logout flag check (don't refetch if logged out)
- [ ] **D)** Disable both, only refetch manually when needed
- [ ] **E)** Keep both but increase interval (5 minutes instead of 2)

**Your choice:** _____

**Recommendation:** Option C (keep both but check logout flag) - best balance of keeping session alive vs preventing auto-login.

---

### Question 3.2: How should we prevent auto-login after logout?

**Options:**
- [ ] **A)** Add `logoutTimestamp` in localStorage, don't refetch if < 5 minutes old
- [ ] **B)** Add `isLoggedOut` flag in session storage (cleared on page close)
- [x ] **C)** Clear all cookies server-side on logout (most reliable)
- [ ] **D)** Combination: Server-side cookie clearing + client-side flag

**Your choice:** _____

---

## 4. Redirect Behavior

### Question 4.1: What should happen when session becomes invalid?

**Current:** User stays on admin/dashboard page even when logged out

**Options:**
- [ x] **A)** Immediate redirect to home when session is null (even if status is 'loading')
- [ ] **B)** Wait for status to be 'unauthenticated' before redirect (current behavior)
- [ ] **C)** Show loading state, then redirect after 2 seconds if still no session
- [ ] **D)** Redirect to login page instead of home

**Your choice:** _____

---

### Question 4.2: Should middleware be more strict?

**Current:** Middleware only checks if token exists, not if it's valid

**Options:**
- [ ] **A)** Keep current (trust JWT callback in layouts)
- [x ] **B)** Make middleware validate token (check if JWT callback would return null)
- [ ] **C)** Middleware redirects if token exists but session is null
- [ ] **D)** Add token validity check in middleware (more secure but slower)

**Your choice:** _____

**Note:** Option B/D might be slower but more secure. Option A is faster but less secure.

---

## 5. Layout Permission Logic

### Question 5.1: How strict should layouts be?

**Current:** Layouts allow access even when `auth()` fails, trusting middleware

**Options:**
- [ ] **A)** Strict: Redirect if `auth()` fails, even if middleware passed
- [ ] **B)** Current: Allow access if middleware passed, even if `auth()` fails
- [ x] **C)** Hybrid: Allow access if middleware passed, but redirect if session is explicitly null
- [ ] **D)** Add retry: Try `auth()` 3 times before redirecting

**Your choice:** _____

---

## 6. ActivityTracker Improvements

### Question 6.1: How should ActivityTracker handle failures?

**Current:** If `update()` fails, session might expire

**Options:**
- [ ] **A)** Add retry logic (retry 3 times with exponential backoff)
- [ ] **B)** Show error message to user if update fails
- [ ] **C)** Increase heartbeat frequency (every 1 minute instead of 2)
- [x ] **D)** All of the above

**Your choice:** _____

---

## 7. Cookie Management

### Question 7.1: How should we handle cookie clearing?

**Current:** Tries to clear cookies client-side (doesn't work for HttpOnly)

**Options:**
- [x ] **A)** Create `/api/auth/logout` endpoint that clears cookies server-side
- [ ] **B)** Use NextAuth's signOut() and ensure it works properly
- [ ] **C)** Set cookies with shorter maxAge on logout (expires immediately)
- [ ] **D)** Combination: Server endpoint + client cleanup

**Your choice:** _____

**Recommendation:** Option A - most reliable for HttpOnly cookies.

---

## 8. Cross-Tab Logout Sync

### Question 8.1: Should we keep cross-tab logout sync?

**Current:** LogoutSync component syncs logout across tabs

**Options:**
- [x ] **A)** Keep current (BroadcastChannel + localStorage)
- [ ] **B)** Simplify (only BroadcastChannel)
- [ ] **C)** Remove (not needed if logout works properly)
- [ ] **D)** Enhance (also sync login state)

**Your choice:** _____

---

## 9. Error Handling

### Question 9.1: How should we handle authentication errors?

**Current:** Some errors are logged but access is still allowed

**Options:**
- [ ] **A)** Strict: Any auth error = redirect to login
- [x ] **B)** Current: Log errors but allow access if middleware passed
- [ ] **C)** Smart: Allow access for known serverless issues, redirect for real errors
- [ ] **D)** Show error message to user before redirecting

**Your choice:** _____

---

## 10. Testing & Rollout

### Question 10.1: How should we test the refactor?

**Options:**
- [x ] **A)** Test locally first, then deploy
- [ ] **B)** Create test branch, test on Netlify preview
- [ ] **C)** Deploy to production and monitor
- [ ] **D)** All of the above (local → preview → production)

**Your choice:** _____

---

## 11. Backward Compatibility

### Question 11.1: Do we need to support old sessions?

**Current:** Code tries to handle legacy tokens (missing fields)

**Options:**
- [ x] **A)** Keep backward compatibility (handle legacy tokens)
- [ ] **B)** Force re-login for all users (simpler code)
- [ ] **C)** Migrate old tokens on first use
- [ ] **D)** Add migration period (support both old and new)

**Your choice:** _____

---

## 12. Additional Features

### Question 12.1: Any additional features you want?

**Options:**
- [ ] **A)** "Remember me" checkbox (longer sessions)
- [ ] **B)** Session timeout warning ("You'll be logged out in 1 minute")
- [ ] **C)** Active sessions list (see all devices logged in)
- [ ] **D)** Force logout all devices option
- [ ] **E)** None of the above

**Your choice:** _____

---

## Summary

Please fill in your choices above, then we'll implement the refactor based on your preferences.

### Quick Reference - My Choices:

1.1 Session duration: _____  
1.2 Inactivity timeout: _____  
2.1 Logout method: _____  
2.2 Post-logout behavior: _____  
3.1 Auto-refetch: _____  
3.2 Prevent auto-login: _____  
4.1 Invalid session redirect: _____  
4.2 Middleware strictness: _____  
5.1 Layout strictness: _____  
6.1 ActivityTracker: _____  
7.1 Cookie clearing: _____  
8.1 Cross-tab sync: _____  
9.1 Error handling: _____  
10.1 Testing: _____  
11.1 Backward compatibility: _____  
12.1 Additional features: _____

---

## Next Steps

Once you've filled in your choices, I'll:
1. Create a refactoring plan based on your answers
2. Implement the changes
3. Test the solution
4. Document what was changed

---

## Questions or Concerns?

If you're unsure about any option, I can explain the trade-offs in more detail. Just let me know which questions you'd like more information on.

