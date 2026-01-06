# Backend Implementation Prompt for Customer Portal

Copy this entire prompt to your other Cursor tab:

---

## 🎯 Task: Create Two Public API Endpoints for Customer Ticket Portal

I need to add two public API endpoints to my existing Node.js email-to-ticket service. These endpoints will allow customers to:
1. Track their ticket status by entering ticket ID (no login required)
2. Submit escalation complaints if their ticket is taking too long

---

## 📋 Requirements

### Endpoint 1: Get Ticket Status (Public)

**Route:** `GET /api/public/ticket/:ticketId`

**Purpose:** Allow customers to view basic ticket information without authentication

**Security:**
- Public endpoint (no auth required)
- Rate limit: 10 requests per minute per IP
- Return only basic info (NO full conversation history)
- Return 404 for non-existent tickets
- Don't expose agent names or internal information

**Response Format:**
```json
{
  "success": true,
  "ticket": {
    "ticket_id": "TICK-20250116-ABC123",
    "subject": "Login issue",
    "status": "in_progress",
    "priority": "medium",
    "customer_email": "customer@example.com",
    "created_at": "2025-01-16T10:30:00Z",
    "updated_at": "2025-01-16T14:20:00Z",
    "message_count": 3
  }
}
```

---

### Endpoint 2: Submit Escalation Complaint

**Route:** `POST /api/public/complaint`

**Purpose:** Allow customers to escalate tickets that are taking too long

**Request Body:**
```json
{
  "ticketId": "TICK-20250116-ABC123",
  "email": "customer@example.com",
  "subject": "Ticket taking too long",
  "complaint": "My ticket has been open for 3 days without response...",
  "urgency": "high"
}
```

**Validation Rules:**
- `ticketId`: Required, must exist in database
- `email`: Required, must match ticket's customer email
- `subject`: Required, not empty
- `complaint`: Required, not empty (no character limit)
- `urgency`: Required, must be one of: 'low', 'medium', 'high', 'critical'

**Rate Limiting:**
- 3 complaints per ticket per day
- 5 complaints per email address per day
- General rate limit: 5 requests per minute per IP

**What It Should Do:**

1. **Validate the complaint:**
   - Check ticket exists
   - Verify email matches ticket's customer_email
   - Validate all fields

2. **Save to database:**
   - Create new `complaints` table if it doesn't exist
   - Generate unique complaint ID (format: `COMP-YYYYMMDD-RANDOM`)
   - Store complaint with timestamp

3. **Send email to admin:**
   - To: Admin email (from env variable)
   - Subject: `[ESCALATION - ${urgency.toUpperCase()}] ${subject}`
   - Body: Include complaint details, ticket info, urgency, link to ticket

4. **Send confirmation to customer:**
   - To: Customer email
   - Subject: `Escalation Complaint Received - ${complaintId}`
   - Body: Acknowledge receipt, provide complaint ID, promise 24h response

**Response:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaintId": "COMP-20250116-XYZ789"
}
```

---

## 🗄️ Database Table Required

Create a new `complaints` table:

```sql
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  complaint_id VARCHAR(50) UNIQUE NOT NULL,
  ticket_id VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  complaint TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved')),
  admin_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_complaints_ticket ON complaints(ticket_id);
CREATE INDEX IF NOT EXISTS idx_complaints_email ON complaints(customer_email);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at);
```

---

## 📧 Email Templates

### Admin Complaint Email Template

**Subject:** `[ESCALATION - HIGH] ${subject}`

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
  <div style="background: #ff6b00; color: white; padding: 20px;">
    <h2>🚨 ESCALATION COMPLAINT - ${urgency.toUpperCase()} URGENCY</h2>
  </div>
  <div style="padding: 20px;">
    <div style="background: #fee; border-left: 4px solid #f00; padding: 10px; margin-bottom: 20px;">
      <strong>⚠️ This complaint requires immediate attention</strong>
    </div>
    
    <h3>Complaint Details</h3>
    <ul>
      <li><strong>Complaint ID:</strong> ${complaintId}</li>
      <li><strong>Original Ticket:</strong> ${ticketId}</li>
      <li><strong>Customer:</strong> ${customerEmail}</li>
      <li><strong>Urgency:</strong> ${urgency}</li>
      <li><strong>Submitted:</strong> ${timestamp}</li>
    </ul>
    
    <h3>Subject</h3>
    <p>${subject}</p>
    
    <h3>Complaint Message</h3>
    <p>${complaint}</p>
    
    <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
      <h4>Original Ticket Information</h4>
      <ul>
        <li>Status: ${ticketStatus}</li>
        <li>Created: ${daysAgo} days ago</li>
        <li>Last Update: ${lastUpdate}</li>
        <li>Priority: ${ticketPriority}</li>
      </ul>
      <a href="${dashboardUrl}/tickets/${ticketId}">View Ticket in Dashboard</a>
    </div>
    
    <p><strong>Action Required:</strong> Please review and respond within 24 hours.</p>
  </div>
</body>
</html>
```

### Customer Confirmation Email

**Subject:** `Escalation Complaint Received - ${complaintId}`

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
  <div style="background: #fbbf24; color: black; padding: 20px;">
    <h2>✅ Escalation Complaint Received</h2>
  </div>
  <div style="padding: 20px;">
    <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 10px; margin: 20px 0;">
      <strong>Thank you for bringing this to our attention</strong>
    </div>
    
    <p>Dear Customer,</p>
    
    <p>We have received your escalation complaint regarding ticket <strong>${ticketId}</strong>.</p>
    
    <ul>
      <li><strong>Complaint ID:</strong> ${complaintId}</li>
      <li><strong>Urgency Level:</strong> ${urgency}</li>
      <li><strong>Submitted:</strong> ${timestamp}</li>
    </ul>
    
    <p>Our management team has been notified and will review your case with priority. 
    You can expect a response within <strong>24 hours</strong>.</p>
    
    <p>We apologize for any inconvenience and appreciate your patience.</p>
    
    <p>
      <a href="${trackingUrl}/track?ticket=${ticketId}">Track Your Ticket</a>
    </p>
    
    <p>Best regards,<br>
    3VLTN Support Team</p>
  </div>
</body>
</html>
```

---

## 🔐 Environment Variables

Add these to your `.env` file:

```env
# Admin Complaint Configuration
ADMIN_EMAIL=admin@3vltn.com
ADMIN_EMAIL_NAME=3VLTN Management

# Rate Limiting
MAX_TICKET_LOOKUPS_PER_MINUTE=10
MAX_COMPLAINTS_PER_TICKET_PER_DAY=3
MAX_COMPLAINTS_PER_EMAIL_PER_DAY=5

# URLs
DASHBOARD_URL=http://localhost:3000
TRACKING_URL=http://localhost:3000

# Company Info
COMPANY_NAME=3VLTN
SUPPORT_EMAIL=support@3vltn.com
```

---

## 🛡️ Security Requirements

1. **Rate Limiting:**
   - Use `express-rate-limit` package
   - Implement per-IP, per-ticket, and per-email limits
   - Return 429 status for rate limit violations

2. **Input Validation:**
   - Sanitize all inputs (use `validator` or similar)
   - Check for SQL injection patterns
   - Validate email format
   - Trim whitespace
   - Limit string lengths

3. **Privacy:**
   - Never return full conversation history
   - Don't expose agent names
   - Don't reveal ticket existence for wrong email

4. **Email Verification:**
   - MUST verify customer email matches ticket owner
   - Case-insensitive email comparison
   - Trim and lowercase emails before comparison

---

## ✅ Testing Checklist

After implementation, test these scenarios:

1. **Ticket Lookup:**
   - [ ] Valid ticket ID returns correct data
   - [ ] Invalid ticket ID returns 404
   - [ ] Rate limiting works (try 11+ requests quickly)

2. **Complaint Submission:**
   - [ ] Valid complaint is saved to database
   - [ ] Admin receives email
   - [ ] Customer receives confirmation email
   - [ ] Wrong email is rejected
   - [ ] Non-existent ticket is rejected
   - [ ] Invalid urgency is rejected
   - [ ] Short complaint text is rejected
   - [ ] Rate limiting works (try submitting multiple times)

3. **Security:**
   - [ ] Cannot see other customer's tickets
   - [ ] Input sanitization works
   - [ ] SQL injection attempts are blocked

---

## 📦 Suggested Package Additions

```bash
npm install express-rate-limit express-validator
```

---

## 🎯 Implementation Tips

1. **Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const ticketLookupLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests
  message: { success: false, error: 'Too many requests' }
});

app.get('/api/public/ticket/:ticketId', ticketLookupLimiter, async (req, res) => {
  // ...
});
```

2. **Email Matching:**
```javascript
const emailsMatch = (email1, email2) => {
  return email1.trim().toLowerCase() === email2.trim().toLowerCase();
};
```

3. **Complaint ID Generation:**
```javascript
function generateComplaintId() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `COMP-${dateStr}-${random}`;
}
```

---

## 🚀 What to Deliver

1. Two working API endpoints
2. New `complaints` database table
3. Rate limiting implemented
4. Email sending for both admin and customer
5. Input validation and error handling
6. Security measures in place

---

**Start by creating the complaints table, then implement the ticket lookup endpoint, and finally the complaint submission endpoint. Test thoroughly!**

Good luck! 🚀

