# Backend Fix: Return Agent Information with Tickets

## 🐛 Issue Found

The `/api/tickets` endpoint is returning `assigned_to` (agent ID) but NOT the agent details:
- Missing: `assigned_agent_name`
- Missing: `assigned_agent_email`
- Missing: `assigned_agent_role`

Frontend is showing "Unassigned" because these fields are `undefined`.

---

## ✅ Solution

Update your tickets API endpoint to JOIN with `dashboard_users` table.

### File to Update:
`/api/tickets/route.js` or wherever your GET /api/tickets endpoint is

### Current Code (Wrong):
```javascript
// This only returns ticket data
app.get('/api/tickets', async (req, res) => {
  const query = `
    SELECT * FROM tickets
    WHERE ...
    ORDER BY created_at DESC
  `;
  
  const result = await pool.query(query);
  res.json({ data: result.rows });
});
```

### Updated Code (Correct):
```javascript
app.get('/api/tickets', async (req, res) => {
  try {
    const { status, priority, email, assigned_to, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT 
        t.*,
        t.assigned_to,
        t.assigned_at,
        t.assignment_method,
        du.id as assigned_agent_id,
        du.full_name as assigned_agent_name,
        du.email as assigned_agent_email,
        du.role as assigned_agent_role
      FROM tickets t
      LEFT JOIN dashboard_users du ON du.id = t.assigned_to
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Filter by status
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // Filter by priority
    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    // Filter by customer email
    if (email) {
      query += ` AND t.email ILIKE $${paramIndex}`;
      params.push(`%${email}%`);
      paramIndex++;
    }
    
    // Filter by assigned agent
    if (assigned_to) {
      if (assigned_to === 'unassigned') {
        query += ` AND t.assigned_to IS NULL`;
      } else {
        query += ` AND t.assigned_to = $${paramIndex}`;
        params.push(parseInt(assigned_to));
        paramIndex++;
      }
    }
    
    // Count total (for pagination)
    const countQuery = query.replace('SELECT t.*, t.assigned_to, t.assigned_at, t.assignment_method, du.id as assigned_agent_id, du.full_name as assigned_agent_name, du.email as assigned_agent_email, du.role as assigned_agent_role', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);
    
    // Execute query
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## For Single Ticket Endpoint:

Update `GET /api/tickets/:ticketId` as well:

```javascript
app.get('/api/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const query = `
      SELECT 
        t.*,
        t.assigned_to,
        t.assigned_at,
        t.assignment_method,
        du.id as assigned_agent_id,
        du.full_name as assigned_agent_name,
        du.email as assigned_agent_email,
        du.role as assigned_agent_role
      FROM tickets t
      LEFT JOIN dashboard_users du ON du.id = t.assigned_to
      WHERE t.ticket_id = $1
    `;
    
    const result = await pool.query(query, [ticketId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    
    // Get all messages for this ticket
    const messagesQuery = `
      SELECT * FROM ticket_messages
      WHERE ticket_id = $1
      ORDER BY created_at ASC
    `;
    const messages = await pool.query(messagesQuery, [ticketId]);
    
    const ticket = result.rows[0];
    ticket.messages = messages.rows;
    
    res.json({ success: true, data: ticket });
    
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## ✅ After Applying Fix

The API will return:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticket_id": "TICK-20251016-T14GCB",
      "email": "customer@example.com",
      "subject": "Help needed",
      "status": "open",
      "priority": "medium",
      "assigned_to": 4,
      "assigned_at": "2025-10-16T10:00:00Z",
      "assignment_method": "auto",
      "assigned_agent_id": 4,
      "assigned_agent_name": "John Smith",         ← NOW INCLUDED!
      "assigned_agent_email": "john@email.com",    ← NOW INCLUDED!
      "assigned_agent_role": "support",            ← NOW INCLUDED!
      "created_at": "2025-10-16T10:00:00Z"
    }
  ]
}
```

---

## 🧪 Testing

After updating the backend:

1. Restart your Node.js server
2. Refresh the tickets page in browser
3. Check console logs - should now show:
   ```
   👤 Agent Info Check: {
     assigned_agent_name: "John Smith"  ← Should appear!
     assigned_agent_email: "john@email.com"
     assigned_to: 4
   }
   ```

---

## 🎯 Quick Fix Command

If you're using the ticket service, update the `/api/tickets` route to include the JOIN:

```sql
LEFT JOIN dashboard_users du ON du.id = t.assigned_to
```

And select these additional fields:
```sql
du.id as assigned_agent_id,
du.full_name as assigned_agent_name,
du.email as assigned_agent_email,
du.role as assigned_agent_role
```

---

**This is a backend fix - the frontend is already ready and waiting for the data!** 🚀

