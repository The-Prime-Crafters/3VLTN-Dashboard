# Updated Role-Based Access Control (RBAC)

## 📊 Access Control Summary

### Role Permissions

| Feature/Page       | Admin | Developer | Support |
|--------------------|-------|-----------|---------|
| **Overview (/)     | ✅    | ❌        | ❌      |
| **Users**          | ✅    | ✅        | ❌      |
| **Plans**          | ✅    | ❌        | ❌      |
| **Tickets**        | ✅    | ✅        | ✅      |
| **Analytics**      | ✅    | ❌        | ❌      |
| **Admin Panel**    | ✅    | ❌        | ❌      |

---

## 👥 Role Details

### 🔴 Admin
**Full Access**
- ✅ Overview Dashboard (statistics, activity, quick actions)
- ✅ Users Management
- ✅ Plans Management
- ✅ Tickets/Support
- ✅ Analytics
- ✅ Admin Panel (user approvals)

**Default Landing Page:** `/` (Overview Dashboard)

---

### 🔵 Developer
**Limited Access**
- ❌ No Overview Dashboard
- ✅ Users Management
- ❌ No Plans
- ✅ Tickets/Support
- ❌ No Analytics
- ❌ No Admin Panel

**Default Landing Page:** `/users`

**What they see in sidebar:**
- Users
- Tickets

---

### 🟢 Support
**Minimal Access**
- ❌ No Overview Dashboard
- ❌ No Users
- ❌ No Plans
- ✅ Tickets/Support only
- ❌ No Analytics
- ❌ No Admin Panel

**Default Landing Page:** `/tickets`

**What they see in sidebar:**
- Tickets (only)

---

## 🔄 Login Flow

### When user logs in:

```
Admin logs in    → Redirects to  /          (Overview Dashboard)
Developer logs in → Redirects to  /users     (Users Page)
Support logs in   → Redirects to  /tickets   (Tickets Page)
```

---

## 🚫 Access Restrictions

### If user tries to access unauthorized page:

```javascript
// Middleware automatically redirects to their default page

Admin tries to access anything     → Allowed (full access)
Developer tries to access /         → Redirected to /users
Developer tries to access /plans    → Redirected to /users
Support tries to access /           → Redirected to /tickets
Support tries to access /users      → Redirected to /tickets
Support tries to access /plans      → Redirected to /tickets
```

---

## 🎨 Navigation Sidebar

### What each role sees:

**Admin:**
```
📊 Overview
👥 Users
💎 Plans
🎫 Tickets
📈 Analytics
👑 Admin Panel
```

**Developer:**
```
👥 Users
🎫 Tickets
```

**Support:**
```
🎫 Tickets
```

---

## 🔧 Technical Implementation

### Files Modified:

1. **`src/middleware.js`**
   - Updated `ROUTE_PERMISSIONS` to restrict `/` to admin only
   - Added `DEFAULT_ROUTES` for role-based redirects
   - Changed redirect logic to use role-specific defaults

2. **`src/app/components/Navigation.js`**
   - Updated `allNavItems` to restrict Overview to admin only
   - Sidebar automatically filters based on user role

3. **`src/app/login/page.js`**
   - Added role-based redirect after successful login
   - Each role goes to their appropriate landing page

4. **`DATABASE_SETUP.md`**
   - Updated role permissions documentation

---

## 📝 Code References

### Middleware Route Permissions
```javascript
const ROUTE_PERMISSIONS = {
  '/': ['admin'],                              // Only admin
  '/users': ['admin', 'developer'],
  '/plans': ['admin'],
  '/tickets': ['admin', 'developer', 'support'],
  '/analytics': ['admin'],
  '/admin-panel': ['admin']
};

const DEFAULT_ROUTES = {
  'admin': '/',
  'developer': '/users',
  'support': '/tickets'
};
```

### Navigation Items
```javascript
const allNavItems = [
  { name: 'Overview', href: '/', icon: '📊', roles: ['admin'] },
  { name: 'Users', href: '/users', icon: '👥', roles: ['admin', 'developer'] },
  { name: 'Plans', href: '/plans', icon: '💎', roles: ['admin'] },
  { name: 'Tickets', href: '/tickets', icon: '🎫', roles: ['admin', 'developer', 'support'] },
  { name: 'Analytics', href: '/analytics', icon: '📈', roles: ['admin'] },
  { name: 'Admin Panel', href: '/admin-panel', icon: '👑', roles: ['admin'] },
];
```

### Login Redirect
```javascript
const defaultRoutes = {
  'admin': '/',
  'developer': '/users',
  'support': '/tickets'
};

const redirectTo = defaultRoutes[data.user?.role] || '/tickets';
router.push(redirectTo);
```

---

## ✅ Benefits of This Setup

1. **Security**: Users can only access pages relevant to their role
2. **UX**: Each role lands on their primary workspace
3. **Simplicity**: Support agents see only what they need (tickets)
4. **Efficiency**: Developers focus on users and tickets
5. **Control**: Admins maintain full oversight

---

## 🧪 Testing Scenarios

### Test Admin Access:
- [x] Can access all pages
- [x] Sees all sidebar items
- [x] Lands on Overview after login
- [x] Can manage all features

### Test Developer Access:
- [x] Cannot access Overview (/)
- [x] Can access Users and Tickets
- [x] Only sees Users + Tickets in sidebar
- [x] Lands on /users after login
- [x] Gets redirected when trying to access restricted pages

### Test Support Access:
- [x] Cannot access Overview, Users, Plans, Analytics
- [x] Can only access Tickets
- [x] Only sees Tickets in sidebar
- [x] Lands on /tickets after login
- [x] Gets redirected when trying to access any other page

---

## 📋 Migration Notes

### For Existing Users:

If you have existing dashboard users, no changes are needed. The new permissions will apply automatically on their next login.

### For New Registrations:

When support or developer users register:
- They will NOT see Overview in their sidebar
- They will be redirected to their appropriate landing page
- Admin approval is still required

---

## 🔒 Security Notes

- All routes are protected by middleware
- Invalid tokens are rejected and cleared
- Unapproved users cannot access any protected routes
- Role checks happen on every page load
- Session validation ensures role integrity

---

**Updated:** October 16, 2025  
**Status:** ✅ Implemented and Active

