# ⚡ Quick Start - Role-Based Access Control

Get your secure dashboard up and running in 5 minutes!

## 🎯 What You're Getting

✅ **Secure Login System** - JWT-based authentication  
✅ **Role-Based Access** - Admin, Developer, Support roles  
✅ **User Approval Flow** - Admins approve new registrations  
✅ **Protected Routes** - Automatic route protection by role  
✅ **Beautiful UI** - Modern login/register pages  

---

## 📋 Prerequisites

- ✅ Neon PostgreSQL database
- ✅ Node.js installed
- ✅ Next.js project set up

---

## 🚀 Setup Steps

### Step 1: Set Environment Variables (1 min)

```bash
# Copy the example file
cp env.example .env.local
```

Edit `.env.local`:
```bash
DATABASE_URL=your-neon-connection-string
JWT_SECRET=your-secure-random-string-here
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Create Database Table (1 min)

Run this SQL in your Neon dashboard:

```sql
CREATE TABLE dashboard_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'developer'::text, 'support'::text])),
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by INTEGER REFERENCES dashboard_users(id),
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_dashboard_users_email ON dashboard_users(email);
CREATE INDEX idx_dashboard_users_role ON dashboard_users(role);
```

### Step 3: Create Admin User (1 min)

Run the helper script:

```bash
npm run create-admin
```

Follow the prompts to enter:
- Email
- Full Name
- Password

### Step 4: Verify Setup (30 sec)

```bash
npm run check-setup
```

This will verify all components are configured correctly.

### Step 5: Start the App (30 sec)

```bash
npm run dev
```

Open: http://localhost:3000/login

---

## 🎓 How to Use

### As Admin (Full Access):

1. **Login** at `/login` with your admin credentials
2. **See all navigation items**: Overview, Users, Plans, Issues, Analytics, Admin Panel
3. **Approve new users** in Admin Panel
4. **Manage everything**

### As Developer (Users & Issues):

1. **Register** at `/register`, choose "Developer" role
2. **Wait for approval** from admin
3. **Login** once approved
4. **Access**: Dashboard, Users, Issues

### As Support (Issues Only):

1. **Register** at `/register`, choose "Support" role
2. **Wait for approval** from admin
3. **Login** once approved
4. **Access**: Dashboard, Issues

---

## 🎭 Role Permissions Quick Reference

| Page | Admin | Developer | Support |
|------|-------|-----------|---------|
| 📊 Dashboard | ✅ | ✅ | ✅ |
| 👥 Users | ✅ | ✅ | ❌ |
| 💎 Plans | ✅ | ❌ | ❌ |
| ⚠️ Issues | ✅ | ✅ | ✅ |
| 📈 Analytics | ✅ | ❌ | ❌ |
| 👑 Admin Panel | ✅ | ❌ | ❌ |

---

## 🔒 Security Features

✅ **Password Hashing** - Bcrypt with 10 salt rounds  
✅ **JWT Tokens** - Secure session management  
✅ **HTTP-Only Cookies** - XSS protection  
✅ **Middleware Protection** - All routes secured  
✅ **Role Validation** - Backend & frontend checks  
✅ **Approval Flow** - Admin must approve new users  

---

## 🧪 Test Your Setup

### Test 1: Admin Access
1. Login as admin
2. Navigate to all pages - should work
3. Go to Admin Panel
4. See all dashboard users

### Test 2: Registration Flow
1. Register a new developer account
2. Try to login - should say "pending approval"
3. Login as admin
4. Approve the new user in Admin Panel
5. Login as the new user - should work

### Test 3: Role Restrictions
1. Login as developer
2. Try to access `/plans` - should redirect to dashboard
3. Try to access `/admin-panel` - should redirect to dashboard
4. Access `/users` and `/issues` - should work

---

## 🆘 Troubleshooting

### "DATABASE_URL not found"
→ Copy `env.example` to `.env.local` and configure it

### "dashboard_users table does not exist"
→ Run the SQL from Step 2 in your Neon dashboard

### "No admin users found"
→ Run `npm run create-admin` to create one

### "Cannot login"
→ Check account is approved and active  
→ Verify password is correct  
→ Check browser console for errors  

### "Page not loading"
→ Run `npm run check-setup` to verify configuration  
→ Check all dependencies are installed  
→ Restart dev server  

---

## 📖 Additional Documentation

- **[RBAC_SETUP.md](./RBAC_SETUP.md)** - Detailed setup guide
- **[SECURITY_GUIDE.md](./SECURITY_GUIDE.md)** - Security best practices
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete database schema

---

## ✨ What's Protected

### Authentication Required:
- All dashboard pages (except `/login` and `/register`)
- All API routes (except auth endpoints)

### Role-Based Access:
- Navigation shows only allowed items
- Routes redirect if role lacks permission
- API endpoints validate role before executing

### Session Management:
- 24-hour token expiration
- Auto-logout on invalid token
- Secure HTTP-only cookies

---

## 🎉 You're Done!

Your dashboard now has:
- ✅ Secure authentication
- ✅ Role-based access control
- ✅ User approval system
- ✅ Professional login/register pages
- ✅ Protected routes
- ✅ Beautiful UI

**Start the server and login to try it out!**

```bash
npm run dev
```

Visit: http://localhost:3000/login

---

## 💡 Pro Tips

1. **Change default admin password** immediately after first login (future feature)
2. **Use strong passwords** - minimum 8 characters, mix of letters/numbers/symbols
3. **Keep JWT_SECRET secure** - never commit to git
4. **Review role permissions** before approving users
5. **Monitor Admin Panel** regularly for pending approvals

---

## 🔄 Next Steps

- [ ] Login as admin
- [ ] Test all role permissions
- [ ] Register test accounts for each role
- [ ] Approve users in Admin Panel
- [ ] Customize role permissions if needed
- [ ] Add more features to protected routes

**Need help?** Check the troubleshooting section or review the documentation files.

