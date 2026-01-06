# Security Guide - Role-Based Access Control

## 🔐 Authentication & Authorization System

This dashboard implements a comprehensive Role-Based Access Control (RBAC) system to manage dashboard user access.

## User Roles & Permissions

### 👑 Admin
**Full Access** - Can access all features:
- ✅ Dashboard Overview
- ✅ Users Management
- ✅ Subscription Plans
- ✅ Issues & Bugs
- ✅ Analytics
- ✅ Admin Panel (User Approval)

### 💻 Developer
**Limited Access** - Focus on technical areas:
- ✅ Dashboard Overview
- ✅ Users Management
- ❌ Subscription Plans
- ✅ Issues & Bugs
- ❌ Analytics
- ❌ Admin Panel

### 🎧 Support
**Issue Management** - Customer support focus:
- ✅ Dashboard Overview
- ❌ Users Management
- ❌ Subscription Plans
- ✅ Issues & Bugs
- ❌ Analytics
- ❌ Admin Panel

## Database Setup

### 1. Create Dashboard Users Table

Run this SQL in your Neon database:

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

### 2. Create Initial Admin User

**IMPORTANT**: You need at least one admin user to approve others. Run this to create your first admin:

```sql
-- Replace with your actual admin credentials
-- Password: 'admin123' (CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!)
INSERT INTO dashboard_users (email, password_hash, full_name, role, is_approved, is_active)
VALUES (
  'admin@3vltn.com', 
  '$2a$10$YourHashedPasswordHere', 
  'System Admin', 
  'admin', 
  true, 
  true
);
```

**To generate a password hash**, you can use this Node.js script:

```javascript
const bcrypt = require('bcryptjs');
const password = 'your-secure-password';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

Or use an online bcrypt generator (with salt rounds = 10).

### 3. Environment Variables

Add to your `.env.local`:

```bash
DATABASE_URL=your-neon-connection-string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## User Registration & Approval Flow

### For New Users:

1. **Register** at `/register`
   - Fill in: Email, Password, Full Name, Role
   - Submit registration

2. **Wait for Approval**
   - Your account will be created with `is_approved = false`
   - You'll see a pending approval message
   - Cannot login until approved

3. **Admin Approves**
   - Admin logs in and goes to Admin Panel
   - Reviews your request
   - Approves or rejects

4. **Login**
   - Once approved, you can login at `/login`
   - Access dashboard features based on your role

### For Admins:

1. **View Pending Users**
   - Go to Admin Panel (`/admin-panel`)
   - See all pending approval requests

2. **Approve/Reject**
   - Review user details (name, email, role)
   - Click "Approve" to grant access
   - Click "Reject" to delete the request

3. **Manage Users**
   - View all dashboard users
   - See their roles, approval status, last login

## Security Features

### 🔒 Password Security
- Minimum 8 characters required
- Passwords hashed with bcrypt (10 salt rounds)
- Never stored in plain text

### 🎫 Session Management
- JWT tokens for authentication
- HTTP-only cookies
- 24-hour session expiry
- Secure cookies in production

### 🛡️ Route Protection
- Middleware validates all requests
- Automatic redirect to login if unauthenticated
- Role-based route access control
- API endpoints protected with role checks

### 🚫 Unauthorized Access Prevention
- Invalid tokens cleared automatically
- Inactive users cannot login
- Unapproved users cannot login
- Role permissions enforced on both frontend and backend

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user session

### Admin Only
- `GET /api/admin/pending` - Get pending approval users
- `GET /api/admin/users` - Get all dashboard users
- `POST /api/admin/approve` - Approve/reject users

## Troubleshooting

### Can't Login
- Verify your account is approved (check with admin)
- Ensure your account is active
- Check password is correct
- Clear browser cookies and try again

### Forgot Password
- Currently no reset flow (future feature)
- Contact your admin for password reset

### Access Denied
- Check your role permissions
- Some routes are restricted by role
- Contact admin if you need different access

## Best Practices

### For Admins:
1. **Change default password immediately**
2. **Review user roles carefully before approving**
3. **Regularly audit dashboard users**
4. **Use strong, unique JWT secret**
5. **Keep database credentials secure**

### For All Users:
1. **Use strong passwords (12+ characters)**
2. **Don't share credentials**
3. **Logout when finished**
4. **Report suspicious activity**

### For Developers:
1. **Never commit .env files**
2. **Rotate JWT secrets periodically**
3. **Keep dependencies updated**
4. **Monitor failed login attempts**
5. **Use HTTPS in production**

## Production Deployment Checklist

- [ ] Change default admin password
- [ ] Generate secure JWT secret (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Enable secure cookies
- [ ] Use HTTPS
- [ ] Backup database regularly
- [ ] Monitor login attempts
- [ ] Set up rate limiting
- [ ] Enable database connection pooling
- [ ] Review and audit all dashboard users

## Support

For security concerns or questions, contact your system administrator.

