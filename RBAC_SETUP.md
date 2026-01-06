# 🔐 Role-Based Access Control (RBAC) Setup Guide

## Quick Start

Follow these steps to set up authentication and user management for your dashboard.

### Step 1: Install Dependencies

```bash
npm install
```

This will install the required packages:
- `bcryptjs` - Password hashing
- `jose` - JWT token handling

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your credentials:
   ```bash
   DATABASE_URL=your-neon-connection-string
   JWT_SECRET=generate-a-secure-random-string
   ```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Create Database Tables

Connect to your Neon database and run:

```sql
-- Create dashboard users table
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

-- Create indexes for better performance
CREATE INDEX idx_dashboard_users_email ON dashboard_users(email);
CREATE INDEX idx_dashboard_users_role ON dashboard_users(role);
```

### Step 4: Create Your First Admin User

You need at least one admin to approve other users. 

**Option A: Using Node.js (Recommended)**

Create a file `create-admin.js`:

```javascript
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function createAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const email = 'admin@yourdomain.com'; // Change this
  const password = 'your-secure-password'; // Change this
  const fullName = 'System Administrator';
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  try {
    const result = await pool.query(
      `INSERT INTO dashboard_users (email, password_hash, full_name, role, is_approved, is_active)
       VALUES ($1, $2, $3, 'admin', true, true)
       RETURNING id, email, full_name, role`,
      [email, passwordHash, fullName]
    );
    
    console.log('✅ Admin user created successfully!');
    console.log(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
```

Run it:
```bash
node create-admin.js
```

**Option B: Using SQL with Pre-hashed Password**

1. Generate password hash using bcrypt online tool or:
   ```bash
   node -e "require('bcryptjs').hash('your-password', 10).then(h => console.log(h))"
   ```

2. Insert into database:
   ```sql
   INSERT INTO dashboard_users (email, password_hash, full_name, role, is_approved, is_active)
   VALUES (
     'admin@yourdomain.com',
     '$2a$10$YOUR_GENERATED_HASH_HERE',
     'System Administrator',
     'admin',
     true,
     true
   );
   ```

### Step 5: Start the Application

```bash
npm run dev
```

Visit: `http://localhost:3000/login`

### Step 6: Login as Admin

Use the credentials you created in Step 4.

### Step 7: Register Additional Users

1. Other users can register at `/register`
2. They choose their role (Developer, Support, or Admin)
3. Their account is created but **not approved**
4. Admin must approve them in Admin Panel

### Step 8: Approve New Users

As admin:
1. Go to **Admin Panel** (👑 icon in navigation)
2. View pending approval requests
3. Click **Approve** or **Reject**
4. Approved users can now login

## 🎭 Role Permissions

| Feature | Admin | Developer | Support |
|---------|-------|-----------|---------|
| Dashboard Overview | ✅ | ✅ | ✅ |
| Users Management | ✅ | ✅ | ❌ |
| Subscription Plans | ✅ | ❌ | ❌ |
| Issues & Bugs | ✅ | ✅ | ✅ |
| Analytics | ✅ | ❌ | ❌ |
| Admin Panel | ✅ | ❌ | ❌ |

## 🔧 Testing the System

### Test Different Roles:

1. **Create Developer Account**
   - Register with role: Developer
   - Admin approves
   - Login → Can see: Dashboard, Users, Issues

2. **Create Support Account**
   - Register with role: Support
   - Admin approves
   - Login → Can see: Dashboard, Issues only

3. **Try Unauthorized Access**
   - Login as Developer
   - Try to access `/plans` → Redirected to Dashboard
   - Try to access `/admin-panel` → Redirected to Dashboard

## 🚨 Troubleshooting

### "Email already registered"
- Email is already in use
- Choose a different email or delete existing user

### "Account pending approval"
- Your account needs admin approval
- Contact your admin

### "Invalid email or password"
- Check credentials are correct
- Ensure account is approved and active

### Cannot access certain pages
- Check your role permissions
- Some pages are restricted by role
- Contact admin if you need different access

### Middleware errors
- Ensure JWT_SECRET is set in .env.local
- Check token is valid
- Try logging out and back in

## 📝 How It Works

### Authentication Flow:

```
1. User visits protected page
   ↓
2. Middleware checks for session cookie
   ↓
3. If no cookie → Redirect to /login
   ↓
4. If cookie exists → Verify JWT
   ↓
5. If valid → Check role permissions
   ↓
6. If authorized → Allow access
   ↓
7. If not authorized → Redirect to dashboard
```

### Registration Flow:

```
1. User fills registration form
   ↓
2. Password hashed with bcrypt
   ↓
3. User created with is_approved=false
   ↓
4. Admin sees in pending approvals
   ↓
5. Admin approves
   ↓
6. User can now login
```

### Session Management:

- JWT tokens stored in HTTP-only cookies
- 24-hour expiration
- Tokens include: user ID, email, role, full name
- Auto-refresh on page load

## 🔐 Security Best Practices

1. **Strong Passwords**
   - Minimum 8 characters
   - Use combination of letters, numbers, symbols

2. **JWT Secret**
   - Use cryptographically random string
   - Minimum 32 characters
   - Never commit to git

3. **Database Access**
   - Keep DATABASE_URL secret
   - Use environment variables only
   - Never hardcode credentials

4. **Production**
   - Use HTTPS
   - Enable secure cookies
   - Set NODE_ENV=production
   - Regular security audits

## 📚 Additional Resources

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Complete database schema
- [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) - Comprehensive security documentation
- [README.md](./README.md) - General dashboard documentation

## 🆘 Need Help?

Common issues and solutions:
- Check all environment variables are set
- Verify database connection works
- Ensure admin user exists and is approved
- Check browser console for errors
- Review server logs for API errors

Still stuck? Review the security guide or check the API routes for detailed error messages.

