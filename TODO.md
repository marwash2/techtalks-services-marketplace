# Navbar Sidebar Toggle Implementation

## Plan

- [x] 1. Create `SidebarContext.tsx` for global sidebar state
- [x] 2. Update `src/app/layout.tsx` to wrap with SidebarProvider
- [x] 3. Create `UserSidebar.tsx` for user role navigation
- [x] 4. Refactor `ProviderSidebar.tsx` to be collapsible and context-aware
- [x] 5. Update `src/app/(provider)/provider/layout.tsx` for sidebar toggle
- [x] 6. Create `src/app/(user)/user/layout.tsx` with UserSidebar
- [x] 7. Update `Navbar.tsx` for logo toggle + notification icon
- [x] 8. Test and verify responsive behavior

## Summary of Changes

### New Files

- `src/components/layout/SidebarContext.tsx` — React Context for sidebar open/close state
- `src/components/user/UserSidebar.tsx` — Collapsible sidebar for user routes
- `src/app/(user)/user/layout.tsx` — User route group layout with sidebar

### Modified Files

- `src/app/layout.tsx` — Wrapped app with `<SidebarProvider>`
- `src/components/provider/ProviderSidebar.tsx` — Added collapse behavior + mobile overlay
- `src/app/(provider)/provider/layout.tsx` — Cleaned spacing
- `src/components/layout/Navbar.tsx` — Key changes:
  - **Guest (no session)**: Design unchanged (logo links home, center nav, auth buttons)
  - **User/Provider logged in**:
    - Notification bell icon appears top-left
    - Logo becomes a toggle button for the sidebar
    - Center nav links removed (sidebar handles navigation)
    - Mobile hamburger removed (logo serves this purpose)

### Login Redirect Fix (Bonus)

- `src/app/(auth)/login/page.tsx` — After credentials sign-in, fetches session and redirects directly to role-based dashboard (`/user/dashboard`, `/provider/dashboard`, or `/admin`) instead of going to `/` first
- `src/app/page.tsx` — Shows a clean loading spinner instead of flashing full home content when an authenticated user lands on `/` (handles Google login and direct URL access)

### How It Works

1. Clicking the **logo** when logged in as `user` or `provider` toggles the sidebar
2. The sidebar slides in/out with a smooth transition
3. On mobile, the sidebar appears as an overlay drawer with a backdrop
4. On desktop, the sidebar collapses to zero width or expands to `260px`
5. Clicking a sidebar link or the backdrop closes the sidebar on mobile
6. After login, users are redirected **directly** to their dashboard with no home-page flash
