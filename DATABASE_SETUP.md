# Database Setup Instructions

## 1. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your Neon database connection string:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
   ```

## 2. Database Schema

### App Users Table
The dashboard expects a `users` table with the following structure:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  subs_tier TEXT NOT NULL CHECK (subs_tier = ANY (ARRAY['freemium'::text, 'basic'::text, 'professional'::text, 'enterprise'::text])),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  first_name TEXT,
  last_name TEXT,
  username TEXT UNIQUE,
  is_google_auth BOOLEAN DEFAULT false,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  mailgun_api_key VARCHAR(255),
  mailgun_domain VARCHAR(255),
  sender_email VARCHAR(255),
  mailgun_configured BOOLEAN DEFAULT false,
  mailgun_test_passed BOOLEAN DEFAULT false,
  mailgun_configured_at TIMESTAMP WITH TIME ZONE,
  phone VARCHAR(20),
  company VARCHAR(255)
);
```

### Dashboard Users Table (RBAC)
For dashboard access control, create a `dashboard_users` table:

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

-- Create an index for faster lookups
CREATE INDEX idx_dashboard_users_email ON dashboard_users(email);
CREATE INDEX idx_dashboard_users_role ON dashboard_users(role);

-- Insert initial admin user (password: admin123)
-- You should change this password immediately after first login!
INSERT INTO dashboard_users (email, password_hash, full_name, role, is_approved, is_active)
VALUES ('admin@3vltn.com', '$2b$10$rKx8LBvQZJQp5H0XYqW3fOqKZ0YvX0YqW3fOqKZ0YvX0YqW3fOqKZ0', 'System Admin', 'admin', true, true);
```

### Role Permissions

- **Admin**: Full access to all features including Overview dashboard, Users, Plans, Tickets, Analytics, and Admin Panel
- **Developer**: Access to Users and Tickets only (no Overview dashboard)
- **Support**: Access to Tickets only (no Overview dashboard)

## 3. Features

### Dashboard Overview
- **Real-time Statistics**: Total users, active plans, revenue, and new users
- **Recent Activity**: Live feed of user actions and system events
- **Quick Actions**: Easy access to common administrative tasks

### Users Management
- **User Statistics**: Comprehensive user metrics and analytics
- **Advanced Filtering**: Search by name, email, username, status, and subscription tier
- **User Table**: Paginated list with real-time data from your Neon database
- **User Actions**: Edit and manage user accounts

### Subscription Plans
- **Plan Statistics**: Revenue, subscriptions, ARPU, and churn rate
- **Plan Cards**: Visual representation of each subscription tier
- **Real-time Data**: Live subscriber counts and revenue per plan

### Issues & Bugs
- **Issue Tracking**: Monitor and manage reported issues
- **Status Management**: Track issue resolution progress
- **Priority System**: Categorize issues by severity

### Analytics
- **Performance Metrics**: Page views, unique visitors, bounce rate
- **Growth Charts**: Visual representation of user and revenue growth
- **Top Users**: Most active users with engagement metrics

## 4. API Endpoints

- `GET /api/users` - Fetch users with pagination and filtering
- `GET /api/users/stats` - Get user statistics
- `GET /api/plans/stats` - Get subscription plan statistics

## 5. Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables (see step 1)

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 6. Database Connection

The application uses PostgreSQL connection pooling for optimal performance. The connection is established using the `DATABASE_URL` environment variable and includes SSL configuration for secure connections to Neon.

## 7. Troubleshooting

- **Connection Issues**: Verify your `DATABASE_URL` is correct and accessible
- **Data Not Loading**: Check browser console for API errors
- **Performance**: Ensure your Neon database has adequate resources for your user base

## 8. Customization

You can customize the dashboard by:
- Modifying the color scheme in `src/app/globals.css`
- Adding new API endpoints in `src/app/api/`
- Creating new dashboard components in `src/app/components/`
- Updating the navigation in `src/app/components/Navigation.js`
