# Dashboard Users Table Reference

## 📊 Current Table Structure

### `dashboard_users` Table

```
┌─────────────────────┬──────────────────────┬─────────────┬──────────┐
│ Column              │ Type                 │ Constraints │ Default  │
├─────────────────────┼──────────────────────┼─────────────┼──────────┤
│ id                  │ SERIAL               │ PRIMARY KEY │ AUTO     │
│ email               │ TEXT                 │ UNIQUE, NOT NULL       │
│ password_hash       │ TEXT                 │ NOT NULL    │          │
│ full_name           │ TEXT                 │ NOT NULL    │          │
│ role                │ TEXT                 │ NOT NULL    │          │
│                     │                      │ CHECK: admin/developer/support │
│ is_approved         │ BOOLEAN              │             │ false    │
│ is_active           │ BOOLEAN              │             │ true     │
│ created_at          │ TIMESTAMP WITH TZ    │             │ now()    │
│ updated_at          │ TIMESTAMP WITH TZ    │             │ now()    │
│ approved_at         │ TIMESTAMP WITH TZ    │             │ NULL     │
│ approved_by         │ INTEGER              │ FK → dashboard_users(id) │
│ last_login          │ TIMESTAMP WITH TZ    │             │ NULL     │
└─────────────────────┴──────────────────────┴─────────────┴──────────┘

Indexes:
• idx_dashboard_users_email ON (email)
• idx_dashboard_users_role ON (role)
```

---

## 👥 Roles and Permissions

| Role        | Access Levels                          | Can Be Assigned Tickets |
|-------------|----------------------------------------|-------------------------|
| **admin**   | Full access to all features            | Optional (configurable) |
| **developer** | Users management + Tickets           | ✅ Yes                  |
| **support** | Tickets only                           | ✅ Yes                  |

---

## 🔄 Proposed Enhancements for Round-Robin

### New Columns to Add

```sql
-- Add ticket assignment tracking
ALTER TABLE dashboard_users
ADD COLUMN active_tickets_count INTEGER DEFAULT 0,
ADD COLUMN total_tickets_assigned INTEGER DEFAULT 0,
ADD COLUMN is_available BOOLEAN DEFAULT true,
ADD COLUMN max_ticket_capacity INTEGER DEFAULT 50;
```

### Updated Table Structure

```
┌─────────────────────────┬──────────────────────┬──────────────┐
│ Column                  │ Type                 │ Purpose      │
├─────────────────────────┼──────────────────────┼──────────────┤
│ ...existing columns...  │                      │              │
│ active_tickets_count    │ INTEGER              │ Current open │
│ total_tickets_assigned  │ INTEGER              │ Lifetime     │
│ is_available            │ BOOLEAN              │ Online/Away  │
│ max_ticket_capacity     │ INTEGER              │ Max workload │
└─────────────────────────┴──────────────────────┴──────────────┘
```

---

## 📋 Sample Data

```sql
-- Example dashboard users
INSERT INTO dashboard_users 
  (email, password_hash, full_name, role, is_approved, is_active)
VALUES
  ('admin@3vltn.com', '$2b$10$...', 'John Admin', 'admin', true, true),
  ('sarah.support@3vltn.com', '$2b$10$...', 'Sarah Support', 'support', true, true),
  ('mike.dev@3vltn.com', '$2b$10$...', 'Mike Developer', 'developer', true, true),
  ('jane.support@3vltn.com', '$2b$10$...', 'Jane Support', 'support', true, true);
```

**Result:**
```
id | email                    | full_name      | role      | is_approved | is_active
---+--------------------------+----------------+-----------+-------------+----------
1  | admin@3vltn.com          | John Admin     | admin     | true        | true
2  | sarah.support@3vltn.com  | Sarah Support  | support   | true        | true
3  | mike.dev@3vltn.com       | Mike Developer | developer | true        | true
4  | jane.support@3vltn.com   | Jane Support   | support   | true        | true
```

---

## 🔄 Round-Robin Assignment Flow

### Eligible Users Query

```sql
-- Get all users eligible for ticket assignment
SELECT id, email, full_name, role, active_tickets_count
FROM dashboard_users
WHERE is_approved = true
  AND is_active = true
  AND is_available = true  -- New column
  AND role IN ('support', 'developer')  -- Configurable
ORDER BY id ASC;
```

**Example Result:**
```
id | email                    | full_name      | role      | active_tickets
---+--------------------------+----------------+-----------+---------------
2  | sarah.support@3vltn.com  | Sarah Support  | support   | 3
3  | mike.dev@3vltn.com       | Mike Developer | developer | 5
4  | jane.support@3vltn.com   | Jane Support   | support   | 2
```

### Round-Robin Rotation

```
Ticket 1 → Sarah (id: 2)
Ticket 2 → Mike (id: 3)
Ticket 3 → Jane (id: 4)
Ticket 4 → Sarah (id: 2)  ← Wraps around
Ticket 5 → Mike (id: 3)
...
```

---

## 📊 Agent Workload Query

```sql
-- View current workload for all agents
SELECT 
  du.id,
  du.full_name,
  du.email,
  du.role,
  du.active_tickets_count,
  du.total_tickets_assigned,
  COUNT(t.id) as current_open_tickets,
  AVG(CASE 
    WHEN t.status = 'resolved' 
    THEN EXTRACT(EPOCH FROM (t.updated_at - t.created_at))/3600 
  END) as avg_resolution_hours
FROM dashboard_users du
LEFT JOIN tickets t ON t.assigned_to = du.id
WHERE du.is_active = true 
  AND du.is_approved = true
  AND du.role IN ('support', 'developer')
GROUP BY du.id
ORDER BY du.active_tickets_count ASC;
```

**Example Output:**
```
id | full_name      | role      | active | total | open | avg_hours
---+----------------+-----------+--------+-------+------+----------
4  | Jane Support   | support   | 2      | 45    | 2    | 4.5
2  | Sarah Support  | support   | 3      | 67    | 3    | 3.8
3  | Mike Developer | developer | 5      | 89    | 5    | 6.2
```

---

## 🎯 Assignment Methods

### Method 1: Pure Round-Robin
- Rotate through agents in order by ID
- Simple, predictable
- May not account for workload

### Method 2: Least-Loaded (Recommended)
```sql
-- Assign to agent with fewest active tickets
SELECT id, full_name, email, active_tickets_count
FROM dashboard_users
WHERE is_approved = true
  AND is_active = true
  AND role IN ('support', 'developer')
ORDER BY active_tickets_count ASC, id ASC
LIMIT 1;
```

### Method 3: Hybrid (Best)
- Use round-robin for primary rotation
- Skip agents who have >X active tickets
- Fall back to least-loaded if everyone is busy

```javascript
function getNextAgent(eligibleAgents, lastAssignedId, maxCapacity = 10) {
  // Filter out overloaded agents
  const availableAgents = eligibleAgents.filter(
    a => a.active_tickets_count < maxCapacity
  );
  
  if (availableAgents.length === 0) {
    // All busy, assign to least loaded
    return eligibleAgents.sort((a, b) => 
      a.active_tickets_count - b.active_tickets_count
    )[0];
  }
  
  // Round-robin through available agents
  const lastIndex = availableAgents.findIndex(a => a.id === lastAssignedId);
  const nextIndex = (lastIndex + 1) % availableAgents.length;
  return availableAgents[nextIndex];
}
```

---

## 🔒 Important Queries

### 1. Get Agent's Active Tickets
```sql
SELECT * FROM tickets
WHERE assigned_to = $1
  AND status IN ('open', 'in_progress')
ORDER BY priority DESC, created_at ASC;
```

### 2. Reassign Ticket
```sql
BEGIN;

-- Update old agent count
UPDATE dashboard_users
SET active_tickets_count = active_tickets_count - 1
WHERE id = (SELECT assigned_to FROM tickets WHERE ticket_id = $1);

-- Assign to new agent
UPDATE tickets
SET assigned_to = $2,
    assigned_at = CURRENT_TIMESTAMP,
    assignment_method = 'manual'
WHERE ticket_id = $1;

-- Update new agent count
UPDATE dashboard_users
SET active_tickets_count = active_tickets_count + 1,
    total_tickets_assigned = total_tickets_assigned + 1
WHERE id = $2;

COMMIT;
```

### 3. Mark Ticket as Resolved (Update Agent Count)
```sql
BEGIN;

UPDATE tickets
SET status = 'resolved',
    updated_at = CURRENT_TIMESTAMP
WHERE ticket_id = $1;

UPDATE dashboard_users
SET active_tickets_count = active_tickets_count - 1
WHERE id = (SELECT assigned_to FROM tickets WHERE ticket_id = $1);

COMMIT;
```

---

## 📈 Monitoring Queries

### Agent Performance Dashboard

```sql
-- Summary stats for each agent
SELECT 
  du.full_name,
  du.role,
  COUNT(CASE WHEN t.status IN ('open', 'in_progress') THEN 1 END) as active,
  COUNT(CASE WHEN t.status = 'resolved' THEN 1 END) as resolved,
  COUNT(CASE WHEN t.status = 'closed' THEN 1 END) as closed,
  ROUND(AVG(
    CASE WHEN t.status IN ('resolved', 'closed') 
    THEN EXTRACT(EPOCH FROM (t.updated_at - t.created_at))/3600 
    END
  ), 2) as avg_resolution_hours,
  MAX(t.created_at) as last_ticket_assigned
FROM dashboard_users du
LEFT JOIN tickets t ON t.assigned_to = du.id
WHERE du.role IN ('support', 'developer')
GROUP BY du.id, du.full_name, du.role
ORDER BY active DESC;
```

---

## 🚀 Quick Start Commands

### View All Agents
```sql
SELECT id, full_name, email, role, is_active, is_approved
FROM dashboard_users
WHERE role IN ('support', 'developer')
ORDER BY id;
```

### View Assignment Distribution
```sql
SELECT 
  du.full_name,
  COUNT(t.id) as total_tickets,
  COUNT(CASE WHEN t.status = 'open' THEN 1 END) as open_tickets
FROM dashboard_users du
LEFT JOIN tickets t ON t.assigned_to = du.id
GROUP BY du.id, du.full_name
ORDER BY total_tickets DESC;
```

### Reset Assignment Counts (Dev/Testing)
```sql
UPDATE dashboard_users
SET active_tickets_count = (
  SELECT COUNT(*) 
  FROM tickets 
  WHERE assigned_to = dashboard_users.id 
    AND status IN ('open', 'in_progress')
);
```

---

## 📝 Notes

- **Password Hashing**: Uses bcrypt (cost factor: 10)
- **Default Admin**: `admin@3vltn.com` / `admin123` (change immediately!)
- **Approval Flow**: New users need admin approval (`is_approved = true`)
- **Active Status**: `is_active = false` to temporarily disable without deletion
- **Timestamps**: All times stored with timezone awareness

---

## 🔗 Related Documentation

- `ROUND_ROBIN_TICKET_ASSIGNMENT_PROMPT.md` - Full implementation guide
- `DATABASE_SETUP.md` - Complete database setup
- `RBAC_SETUP.md` - Role-based access control details

---

**Ready to implement? Use the prompt file to add round-robin assignment!** 🎯

