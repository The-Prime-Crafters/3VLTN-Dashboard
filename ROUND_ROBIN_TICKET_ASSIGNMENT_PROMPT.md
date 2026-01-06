# Round-Robin Ticket Assignment System - Implementation Prompt

## 🎯 Task: Implement Automatic Ticket Assignment with Round-Robin Algorithm

I need to enhance my existing email-to-ticket Node.js service to automatically assign incoming tickets to dashboard users (support agents) using a round-robin algorithm.

---

## 📋 Current System Overview

### Existing Tables

**1. Dashboard Users Table (`dashboard_users`)**
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
```

**Roles:**
- `admin` - Full access (can be assigned tickets optionally)
- `developer` - Access to users and tickets
- `support` - Access to tickets only

**2. Tickets Table (Existing)**
Assumes you already have a `tickets` table with structure similar to:
```sql
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  ticket_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 What I Need

### 1. Database Modifications

**A. Add Assignment Field to Tickets Table**
```sql
-- Add column to store assigned dashboard user
ALTER TABLE tickets 
ADD COLUMN assigned_to INTEGER REFERENCES dashboard_users(id),
ADD COLUMN assigned_at TIMESTAMP,
ADD COLUMN assignment_method VARCHAR(20) DEFAULT 'auto'; -- 'auto' or 'manual'

-- Create index for faster lookups
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
```

**B. Create Round-Robin Tracking Table**
```sql
-- Track the last assigned user for round-robin rotation
CREATE TABLE ticket_assignment_tracker (
  id SERIAL PRIMARY KEY,
  last_assigned_user_id INTEGER REFERENCES dashboard_users(id),
  last_assignment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_assignments INTEGER DEFAULT 0
);

-- Insert initial row
INSERT INTO ticket_assignment_tracker (last_assigned_user_id, total_assignments)
VALUES (NULL, 0);
```

**C. Add Assignment Statistics to Dashboard Users**
```sql
-- Track how many tickets each user has
ALTER TABLE dashboard_users
ADD COLUMN active_tickets_count INTEGER DEFAULT 0,
ADD COLUMN total_tickets_assigned INTEGER DEFAULT 0;
```

---

## 🔄 Round-Robin Assignment Logic

### Algorithm Requirements

1. **Eligible Users:**
   - Role: `support` OR `developer` (optionally include `admin`)
   - `is_approved = true`
   - `is_active = true`
   - Sorted by ID for consistency

2. **Round-Robin Rotation:**
   - Get the last assigned user ID from `ticket_assignment_tracker`
   - Find the next eligible user in the sorted list
   - If at the end of the list, wrap around to the first user
   - Update the tracker with the new assignment

3. **Fair Distribution:**
   - Ensure tickets are evenly distributed
   - Track active tickets per user
   - Optionally: Consider workload balancing (assign to user with fewest active tickets)

4. **Fallback:**
   - If no eligible users are found, leave `assigned_to` as NULL
   - Send alert to admin

---

## 💻 Implementation Requirements

### Backend Service Changes

**When a new ticket is created (via email or API):**

1. **Step 1: Get Eligible Users**
```javascript
async function getEligibleAgents() {
  // Get all active, approved support/developer users
  const query = `
    SELECT id, email, full_name, role, active_tickets_count
    FROM dashboard_users
    WHERE is_approved = true
      AND is_active = true
      AND role IN ('support', 'developer')
    ORDER BY id ASC
  `;
  
  const result = await pool.query(query);
  return result.rows;
}
```

2. **Step 2: Get Next User (Round-Robin)**
```javascript
async function getNextAgentRoundRobin(eligibleAgents) {
  if (eligibleAgents.length === 0) return null;

  // Get last assigned user
  const trackerQuery = `
    SELECT last_assigned_user_id 
    FROM ticket_assignment_tracker 
    LIMIT 1
  `;
  const tracker = await pool.query(trackerQuery);
  const lastAssignedId = tracker.rows[0]?.last_assigned_user_id;

  // Find next user in round-robin
  if (!lastAssignedId) {
    // First assignment ever
    return eligibleAgents[0];
  }

  // Find index of last assigned user
  const lastIndex = eligibleAgents.findIndex(u => u.id === lastAssignedId);
  
  // Get next user (wrap around if at end)
  const nextIndex = (lastIndex + 1) % eligibleAgents.length;
  return eligibleAgents[nextIndex];
}
```

3. **Step 3: Assign Ticket**
```javascript
async function assignTicketToAgent(ticketId, agentId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Update ticket with assignment
    await client.query(`
      UPDATE tickets 
      SET assigned_to = $1,
          assigned_at = CURRENT_TIMESTAMP,
          assignment_method = 'auto'
      WHERE ticket_id = $2
    `, [agentId, ticketId]);

    // Update tracker
    await client.query(`
      UPDATE ticket_assignment_tracker
      SET last_assigned_user_id = $1,
          last_assignment_time = CURRENT_TIMESTAMP,
          total_assignments = total_assignments + 1
    `, [agentId]);

    // Update agent's ticket count
    await client.query(`
      UPDATE dashboard_users
      SET active_tickets_count = active_tickets_count + 1,
          total_tickets_assigned = total_tickets_assigned + 1
      WHERE id = $1
    `, [agentId]);

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

4. **Step 4: Main Assignment Function**
```javascript
async function autoAssignTicket(ticketId) {
  try {
    // Get eligible agents
    const eligibleAgents = await getEligibleAgents();
    
    if (eligibleAgents.length === 0) {
      console.warn('No eligible agents available for assignment');
      // TODO: Send alert to admin
      return null;
    }

    // Get next agent via round-robin
    const nextAgent = await getNextAgentRoundRobin(eligibleAgents);
    
    // Assign ticket
    await assignTicketToAgent(ticketId, nextAgent.id);
    
    console.log(`Ticket ${ticketId} assigned to ${nextAgent.full_name} (${nextAgent.email})`);
    
    // TODO: Send email notification to agent
    await notifyAgentOfNewAssignment(nextAgent, ticketId);
    
    return nextAgent;
  } catch (error) {
    console.error('Error in auto-assignment:', error);
    throw error;
  }
}
```

5. **Step 5: Update Ticket Creation**
```javascript
// In your existing ticket creation endpoint
app.post('/api/tickets', async (req, res) => {
  try {
    // ... existing ticket creation code ...
    
    // Create ticket in database
    const newTicket = await createTicket(ticketData);
    
    // AUTO-ASSIGN via round-robin
    const assignedAgent = await autoAssignTicket(newTicket.ticket_id);
    
    if (assignedAgent) {
      console.log(`✅ Auto-assigned to: ${assignedAgent.full_name}`);
    } else {
      console.warn('⚠️ No agent assigned - no eligible agents available');
    }
    
    res.json({ success: true, ticket: newTicket, assigned_to: assignedAgent });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 📧 Agent Notification Email

When a ticket is assigned, send an email to the agent:

```javascript
async function notifyAgentOfNewAssignment(agent, ticketId) {
  const ticket = await getTicketById(ticketId);
  
  const emailSubject = `New Ticket Assigned: ${ticket.subject}`;
  const emailBody = `
    <h2>New Ticket Assigned to You</h2>
    <p>Hello ${agent.full_name},</p>
    <p>A new support ticket has been automatically assigned to you.</p>
    
    <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
      <h3>Ticket Details</h3>
      <ul>
        <li><strong>Ticket ID:</strong> ${ticket.ticket_id}</li>
        <li><strong>Customer:</strong> ${ticket.email}</li>
        <li><strong>Subject:</strong> ${ticket.subject}</li>
        <li><strong>Priority:</strong> ${ticket.priority}</li>
        <li><strong>Created:</strong> ${new Date(ticket.created_at).toLocaleString()}</li>
      </ul>
    </div>
    
    <p><strong>Customer Message:</strong></p>
    <p>${ticket.message}</p>
    
    <p>
      <a href="${process.env.DASHBOARD_URL}/tickets/${ticket.ticket_id}" 
         style="background: #fbbf24; color: black; padding: 10px 20px; text-decoration: none; border-radius: 8px;">
        View Ticket in Dashboard
      </a>
    </p>
    
    <p>Please respond as soon as possible.</p>
    <p>Best regards,<br>3VLTN Support System</p>
  `;
  
  await sendEmail(agent.email, emailSubject, emailBody);
}
```

---

## 🎛️ API Endpoints to Add

### 1. Manual Re-assignment
```javascript
// PUT /api/tickets/:ticketId/assign
// Allows admin to manually reassign tickets
app.put('/api/tickets/:ticketId/assign', requireAuth, requireRole(['admin']), async (req, res) => {
  const { ticketId } = req.params;
  const { agentId } = req.body;
  
  try {
    await assignTicketToAgent(ticketId, agentId);
    res.json({ success: true, message: 'Ticket reassigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 2. Get Agent Workload
```javascript
// GET /api/agents/workload
// Get current workload for all agents
app.get('/api/agents/workload', requireAuth, async (req, res) => {
  try {
    const query = `
      SELECT 
        du.id,
        du.full_name,
        du.email,
        du.role,
        du.active_tickets_count,
        du.total_tickets_assigned,
        COUNT(t.id) as current_open_tickets
      FROM dashboard_users du
      LEFT JOIN tickets t ON t.assigned_to = du.id AND t.status IN ('open', 'in_progress')
      WHERE du.is_active = true AND du.is_approved = true
      GROUP BY du.id
      ORDER BY du.active_tickets_count ASC
    `;
    
    const result = await pool.query(query);
    res.json({ success: true, agents: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 3. Get Agent's Assigned Tickets
```javascript
// GET /api/agents/:agentId/tickets
app.get('/api/agents/:agentId/tickets', requireAuth, async (req, res) => {
  const { agentId } = req.params;
  const { status } = req.query; // optional filter
  
  try {
    let query = `
      SELECT * FROM tickets 
      WHERE assigned_to = $1
    `;
    const params = [agentId];
    
    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, tickets: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 📊 Dashboard Updates Needed

### Show Assigned Agent in Ticket List

Update the tickets table to show:
- Assigned agent name
- Agent avatar/icon
- Filter by assigned agent
- Sort by assignment date

### Agent Statistics Widget

Show for each agent:
- Active tickets
- Total tickets assigned
- Average response time
- Resolution rate

---

## 🔧 Environment Variables

Add to your `.env`:

```env
# Round-Robin Configuration
ENABLE_AUTO_ASSIGNMENT=true
INCLUDE_ADMINS_IN_ASSIGNMENT=false  # Whether to include admins in round-robin
INCLUDE_DEVELOPERS_IN_ASSIGNMENT=true  # Whether to include developers

# Agent Notification
NOTIFY_AGENT_ON_ASSIGNMENT=true
AGENT_DASHBOARD_URL=http://localhost:3000
```

---

## ✅ Features to Implement

### Phase 1 (MVP):
- [x] Database schema modifications
- [x] Round-robin assignment algorithm
- [x] Auto-assign on ticket creation
- [x] Email notification to assigned agent

### Phase 2 (Enhanced):
- [ ] Manual re-assignment by admin
- [ ] Workload balancing (assign to agent with fewest active tickets)
- [ ] Agent availability status (online/offline/away)
- [ ] Business hours consideration
- [ ] Skill-based routing (assign based on ticket category)

### Phase 3 (Advanced):
- [ ] Load balancing (consider response time, resolution rate)
- [ ] Priority-based assignment (urgent tickets to senior agents)
- [ ] Automatic reassignment if no response within X hours
- [ ] Agent performance metrics
- [ ] Assignment history and analytics

---

## 🧪 Testing Checklist

- [ ] Create ticket → should auto-assign to first eligible agent
- [ ] Create multiple tickets → should rotate through agents in order
- [ ] Test with no eligible agents → should handle gracefully
- [ ] Test manual reassignment → should update correctly
- [ ] Test agent receives email notification
- [ ] Test ticket counts are updated correctly
- [ ] Test round-robin wraps around correctly
- [ ] Test with only one agent available
- [ ] Test transaction rollback on error

---

## 🚀 Implementation Steps

1. **Run database migrations** (add new columns and tables)
2. **Implement assignment functions** in your Node.js service
3. **Update ticket creation endpoint** to call auto-assignment
4. **Add email notification function**
5. **Test round-robin algorithm** with multiple tickets
6. **Add API endpoints** for manual assignment and workload view
7. **Update dashboard UI** to show assigned agents
8. **Deploy and monitor**

---

## 📈 Success Metrics

After implementation, you should see:
- ✅ Tickets automatically assigned within seconds of creation
- ✅ Even distribution of tickets across agents
- ✅ Agents receive instant email notifications
- ✅ Admin can view workload distribution
- ✅ Manual reassignment works smoothly

---

**Start by implementing Phase 1 (MVP) and then enhance with Phase 2 and 3 features!**

Good luck! 🚀

