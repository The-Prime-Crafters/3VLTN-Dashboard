# Customer Portal Backend Service Requirements

## Overview
The customer portal requires two new public API endpoints that don't require authentication. These endpoints will allow customers to:
1. Track their ticket status by ticket ID
2. Submit escalation complaints to admin

---

## 🎯 Required Backend API Endpoints

### 1. Get Ticket Status (Public)
**Endpoint:** `GET /api/public/ticket/:ticketId`

**Purpose:** Allow customers to view their ticket status without logging in

**Request Parameters:**
- `ticketId` (URL parameter) - The ticket ID (e.g., TICK-20250116-ABC123)

**Response:**
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

**Security Considerations:**
- ✅ No authentication required (public endpoint)
- ✅ Do NOT return full conversation history (privacy)
- ✅ Do NOT return agent information
- ✅ Only return basic status information
- ✅ Rate limit: 10 requests per minute per IP
- ✅ Return 404 if ticket not found (don't reveal if ticket exists for security)

**Error Responses:**
```json
// Ticket not found
{
  "success": false,
  "error": "Ticket not found"
}

// Rate limit exceeded
{
  "success": false,
  "error": "Too many requests"
}
```

---

### 2. Submit Escalation Complaint
**Endpoint:** `POST /api/public/complaint`

**Purpose:** Allow customers to escalate tickets and send complaint emails to admin

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
- `email`: Required, valid email format, must match ticket's customer email
- `subject`: Required, not empty
- `complaint`: Required, not empty (no character limit)
- `urgency`: Required, enum: ['low', 'medium', 'high', 'critical']

**Response:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaintId": "COMP-20250116-XYZ789"
}
```

**What the Backend Should Do:**
1. **Validate the complaint:**
   - Check if ticket ID exists
   - Verify email matches the ticket's customer email
   - Validate all required fields
   
2. **Store the complaint:**
   - Save complaint to database (new `complaints` table)
   - Link it to the original ticket
   - Record timestamp and urgency level

3. **Send email to admin:**
   - To: Admin email (from environment variable)
   - Subject: `[ESCALATION - ${urgency.toUpperCase()}] ${subject}`
   - Body should include:
     ```
     ESCALATION COMPLAINT
     
     Complaint ID: COMP-20250116-XYZ789
     Original Ticket: TICK-20250116-ABC123
     Customer Email: customer@example.com
     Urgency: High
     Submitted: 2025-01-16 15:30:00
     
     Subject: Ticket taking too long
     
     Complaint Details:
     My ticket has been open for 3 days without response...
     
     ---
     
     Original Ticket Info:
     - Status: in_progress
     - Created: 2025-01-13 10:30:00
     - Days Open: 3
     - Last Update: 2025-01-14 09:15:00
     
     View ticket: [Link to internal dashboard]
     ```

4. **Send confirmation to customer:**
   - To: Customer email
   - Subject: `Escalation Complaint Received - ${complaintId}`
   - Body:
     ```
     Dear Customer,
     
     We have received your escalation complaint regarding ticket ${ticketId}.
     
     Complaint ID: ${complaintId}
     Urgency Level: ${urgency}
     
     Our management team has been notified and will review your case.
     You can expect a response within 24 hours.
     
     Thank you for your patience.
     
     Best regards,
     3VLTN Support Team
     ```

**Error Responses:**
```json
// Ticket not found
{
  "success": false,
  "error": "Ticket ID not found"
}

// Email mismatch
{
  "success": false,
  "error": "Email does not match ticket customer"
}

// Validation error
{
  "success": false,
  "error": "Complaint cannot be empty"
}

// Rate limit
{
  "success": false,
  "error": "Too many complaints submitted"
}
```

**Security Considerations:**
- ✅ Verify email matches ticket owner
- ✅ Rate limit: 3 complaints per ticket per day
- ✅ Rate limit: 5 complaints per email per day
- ✅ Sanitize all input to prevent XSS/SQL injection
- ✅ Log all complaints for audit trail

---

## 📊 New Database Table: `complaints`

```sql
CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  complaint_id VARCHAR(50) UNIQUE NOT NULL,
  ticket_id VARCHAR(50) NOT NULL REFERENCES tickets(ticket_id),
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

CREATE INDEX idx_complaints_ticket ON complaints(ticket_id);
CREATE INDEX idx_complaints_email ON complaints(customer_email);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created ON complaints(created_at);
```

---

## 🔐 Environment Variables Needed

Add these to your Node.js ticket service `.env` file:

```env
# Admin Complaint Email
ADMIN_EMAIL=admin@3vltn.com
ADMIN_EMAIL_NAME=3VLTN Management

# Rate Limiting
MAX_TICKET_LOOKUPS_PER_MINUTE=10
MAX_COMPLAINTS_PER_TICKET_PER_DAY=3
MAX_COMPLAINTS_PER_EMAIL_PER_DAY=5

# Email Templates
COMPANY_NAME=3VLTN
SUPPORT_EMAIL=support@3vltn.com
```

---

## 🚀 Implementation Checklist

### Backend (Node.js Service)
- [ ] Create `/api/public/ticket/:ticketId` GET endpoint
- [ ] Create `/api/public/complaint` POST endpoint
- [ ] Create `complaints` database table
- [ ] Implement rate limiting middleware
- [ ] Add email validation (verify email matches ticket)
- [ ] Send complaint email to admin
- [ ] Send confirmation email to customer
- [ ] Add logging for all complaints
- [ ] Add error handling and validation
- [ ] Test both endpoints

### Frontend (Next.js - Already Done! ✅)
- [x] Create `/track` page for ticket status lookup
- [x] Create `/complaint` page for escalation form
- [x] Add client-side validation
- [x] Add loading states and error handling
- [x] Add success confirmation UI
- [x] Add urgency indicators for old tickets

---

## 📧 Email Template Examples

### Admin Complaint Email
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .header { background: #ff6b00; color: white; padding: 20px; }
    .content { padding: 20px; }
    .urgent { background: #fee; border-left: 4px solid #f00; padding: 10px; }
    .info { background: #f5f5f5; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h2>🚨 ESCALATION COMPLAINT - HIGH URGENCY</h2>
  </div>
  <div class="content">
    <div class="urgent">
      <strong>⚠️ This complaint requires immediate attention</strong>
    </div>
    
    <h3>Complaint Details</h3>
    <ul>
      <li><strong>Complaint ID:</strong> COMP-20250116-XYZ789</li>
      <li><strong>Original Ticket:</strong> TICK-20250116-ABC123</li>
      <li><strong>Customer:</strong> customer@example.com</li>
      <li><strong>Urgency:</strong> High</li>
      <li><strong>Submitted:</strong> 2025-01-16 15:30:00</li>
    </ul>
    
    <h3>Subject</h3>
    <p>Ticket taking too long</p>
    
    <h3>Complaint Message</h3>
    <p>My ticket has been open for 3 days without response...</p>
    
    <div class="info">
      <h4>Original Ticket Information</h4>
      <ul>
        <li>Status: In Progress</li>
        <li>Created: 3 days ago</li>
        <li>Last Update: 2 days ago</li>
        <li>Priority: Medium</li>
      </ul>
      <a href="http://dashboard.3vltn.com/tickets/TICK-20250116-ABC123">View Ticket in Dashboard</a>
    </div>
    
    <p><strong>Action Required:</strong> Please review and respond within 24 hours.</p>
  </div>
</body>
</html>
```

### Customer Confirmation Email
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .header { background: #fbbf24; color: black; padding: 20px; }
    .content { padding: 20px; }
    .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 10px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h2>✅ Escalation Complaint Received</h2>
  </div>
  <div class="content">
    <div class="success">
      <strong>Thank you for bringing this to our attention</strong>
    </div>
    
    <p>Dear Customer,</p>
    
    <p>We have received your escalation complaint regarding ticket <strong>TICK-20250116-ABC123</strong>.</p>
    
    <ul>
      <li><strong>Complaint ID:</strong> COMP-20250116-XYZ789</li>
      <li><strong>Urgency Level:</strong> High</li>
      <li><strong>Submitted:</strong> January 16, 2025 at 3:30 PM</li>
    </ul>
    
    <p>Our management team has been notified and will review your case with priority. 
    You can expect a response within <strong>24 hours</strong>.</p>
    
    <p>We apologize for any inconvenience and appreciate your patience.</p>
    
    <p>
      <a href="http://support.3vltn.com/track?ticket=TICK-20250116-ABC123">Track Your Ticket</a>
    </p>
    
    <p>Best regards,<br>
    3VLTN Support Team</p>
  </div>
</body>
</html>
```

---

## 🎨 Additional Features (Optional)

### Admin Dashboard Integration
Add a "Complaints" section to the admin panel:
- View all pending complaints
- Mark complaints as "reviewing" or "resolved"
- Add admin notes
- Quick link to original ticket
- Filter by urgency/status
- Email response template

### Analytics
Track complaint metrics:
- Average time to first response after complaint
- Complaint resolution rate
- Most common complaint reasons
- Tickets with multiple complaints

---

## 🔒 Security Best Practices

1. **Input Validation:**
   - Sanitize all user inputs
   - Validate email format
   - Limit string lengths
   - Check for SQL injection patterns

2. **Rate Limiting:**
   - IP-based rate limiting
   - Email-based rate limiting
   - Ticket-based rate limiting
   - Progressive delays for repeated attempts

3. **Privacy:**
   - Don't expose full ticket conversation
   - Don't reveal agent information
   - Don't confirm ticket existence for wrong email
   - Log all access attempts

4. **Spam Prevention:**
   - CAPTCHA for form submission (optional)
   - Email verification
   - Honeypot fields
   - Check for duplicate submissions

---

## 📝 Testing Checklist

- [ ] Test ticket lookup with valid ID
- [ ] Test ticket lookup with invalid ID
- [ ] Test complaint submission with valid data
- [ ] Test complaint submission with mismatched email
- [ ] Test complaint submission with invalid ticket
- [ ] Test rate limiting (multiple rapid requests)
- [ ] Test email delivery to admin
- [ ] Test confirmation email to customer
- [ ] Test with special characters in complaint text
- [ ] Test with very long complaint text
- [ ] Test urgency level validation
- [ ] Test database constraint enforcement

---

## 🚀 Deployment Notes

1. Update environment variables in production
2. Test email delivery in production environment
3. Configure proper rate limiting rules
4. Set up monitoring for complaint submissions
5. Create admin alerts for critical urgency complaints
6. Add Google Analytics/tracking for customer portal pages

---

**Need help implementing these endpoints? Let me know!** 🚀

