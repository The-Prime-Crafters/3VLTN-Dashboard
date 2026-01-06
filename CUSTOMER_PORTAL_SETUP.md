# Customer Portal - Quick Setup Guide

## 🎉 What's Been Created

### Frontend (Next.js Dashboard) - ✅ DONE

1. **`/track` - Ticket Status Tracking Page**
   - Beautiful, modern UI matching your dashboard design
   - Customer enters ticket ID to check status
   - Shows:
     - Current status (Open, In Progress, Resolved, Closed)
     - Priority level
     - Days since creation
     - Last update date
     - Message count
     - Status-specific messages
   - Auto-suggests complaint option if ticket is >2 days old and still open/in_progress
   - Fully responsive design

2. **`/complaint` - Escalation Complaint Form**
   - Professional complaint submission form
   - Fields:
     - Ticket ID (required)
     - Email (required, must match ticket)
     - Subject (required)
     - Urgency level (low/medium/high/critical)
     - Detailed complaint message (required)
   - Success confirmation page
   - Links back to ticket tracking
   - URL parameter support: `/complaint?ticket=TICK-123` pre-fills ticket ID

3. **Design Features:**
   - 🎨 Glassmorphism effects
   - ✨ Gradient accents (yellow/orange theme)
   - 🌈 Status-based color coding
   - 📱 Fully responsive
   - ⚡ Loading states
   - 🎯 Error handling
   - 🔔 Info banners
   - 💫 Smooth animations

---

## 🛠️ What You Need to Build (Backend)

### Node.js Ticket Service - Two New API Endpoints

#### 1. GET `/api/public/ticket/:ticketId`
**Purpose:** Fetch ticket status for customers

**Required:**
- No authentication (public endpoint)
- Rate limiting (10 req/min per IP)
- Returns basic ticket info only (no full conversation)
- Security: Don't expose agent info

#### 2. POST `/api/public/complaint`
**Purpose:** Submit escalation complaints

**Required:**
- Validate ticket exists
- Verify email matches ticket owner
- Save complaint to database
- Send email to admin (with full details)
- Send confirmation to customer
- Rate limiting (3 per ticket/day, 5 per email/day)

**Database Table:**
```sql
CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  complaint_id VARCHAR(50) UNIQUE NOT NULL,
  ticket_id VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  complaint TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 📧 Email Requirements

**Admin Complaint Email:**
- Subject: `[ESCALATION - URGENCY] Subject`
- Include: Complaint details, ticket info, urgency level
- Make it visually distinct (red/orange styling)

**Customer Confirmation:**
- Subject: `Escalation Complaint Received - COMP-ID`
- Include: Complaint ID, expected response time (24h)
- Reassuring tone

---

## 📋 Complete Backend Specification

See **`CUSTOMER_PORTAL_BACKEND.md`** for:
- ✅ Full API endpoint specifications
- ✅ Request/response examples
- ✅ Validation rules
- ✅ Security requirements
- ✅ Database schema
- ✅ Email templates (HTML)
- ✅ Error handling
- ✅ Rate limiting strategies
- ✅ Testing checklist

---

## 🚀 How to Test (After Backend is Ready)

### 1. Test Ticket Tracking
```
1. Go to http://localhost:3000/track
2. Enter a valid ticket ID: TICK-20250116-ABC123
3. Should show ticket details
4. If ticket is >2 days old, should show complaint option
```

### 2. Test Complaint Form
```
1. Go to http://localhost:3000/complaint
2. Or click "File Complaint" from track page
3. Fill in all fields
4. Submit
5. Should see success message
6. Check admin email
7. Check customer email
```

### 3. Test Error Cases
```
- Invalid ticket ID → Error message
- Wrong email → Error message
- Empty fields → Validation errors
- Rate limiting → Too many requests error
```

---

## 🔗 Integration Points

### Frontend → Backend
The frontend makes these API calls:

```javascript
// Ticket lookup
fetch(`${process.env.NEXT_PUBLIC_TICKET_API_URL}/api/public/ticket/${ticketId}`)

// Complaint submission
fetch(`${process.env.NEXT_PUBLIC_TICKET_API_URL}/api/public/complaint`, {
  method: 'POST',
  body: JSON.stringify(complaintData)
})
```

### Environment Variable
Already configured in `env.example`:
```env
NEXT_PUBLIC_TICKET_API_URL=http://localhost:3001
```

Make sure this is set in your `.env.local` file!

---

## 🎨 Design Preview

### Track Page
```
┌─────────────────────────────────────┐
│  🟡 3V  3VLTN Support               │
│      Track Your Support Ticket      │
├─────────────────────────────────────┤
│  🎫 Enter Your Ticket ID            │
│  [TICK-20250116-ABC123        ]     │
│  🔍 Track Ticket                    │
├─────────────────────────────────────┤
│  Login Issue                        │
│  Ticket ID: TICK-20250116-ABC123    │
│                          🟡 OPEN    │
│  ┌───────────────────────────────┐  │
│  │ Created: Jan 16, 2025         │  │
│  │ Priority: Medium              │  │
│  │ Last Updated: Jan 16, 2025    │  │
│  └───────────────────────────────┘  │
│  💡 Ticket received, waiting...     │
│  ┌───────────────────────────────┐  │
│  │ ⏰ Taking longer than expected?│  │
│  │ [📢 File Escalation Complaint]│  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Complaint Page
```
┌─────────────────────────────────────┐
│  🟡 3V  3VLTN Support               │
│      Escalation Complaint           │
├─────────────────────────────────────┤
│  ℹ️ When to file a complaint:      │
│  • Ticket open >48h without reply   │
│  • Urgent issue needs attention     │
├─────────────────────────────────────┤
│  🎫 Ticket ID *                     │
│  [TICK-20250116-ABC123        ]     │
│                                     │
│  📧 Email *                         │
│  [customer@email.com          ]     │
│                                     │
│  📝 Subject *                       │
│  [Taking too long            ]     │
│                                     │
│  🔥 Urgency Level *                 │
│  [High - Need urgent attention ▼]   │
│                                     │
│  💬 Complaint Details *             │
│  [                            ]     │
│  [                            ]     │
│  [                            ]     │
│                                     │
│  [📢 Submit Escalation Complaint]   │
└─────────────────────────────────────┘
```

---

## ✅ Checklist

### Frontend (Already Done! ✅)
- [x] Create `/track` page
- [x] Create `/complaint` page
- [x] Add form validation
- [x] Add loading states
- [x] Add error handling
- [x] Add success messages
- [x] Mobile responsive design
- [x] Match dashboard styling

### Backend (Your Task)
- [ ] Create public ticket lookup endpoint
- [ ] Create complaint submission endpoint
- [ ] Add `complaints` database table
- [ ] Implement rate limiting
- [ ] Email validation (match ticket owner)
- [ ] Send admin complaint email
- [ ] Send customer confirmation email
- [ ] Add security measures
- [ ] Test all endpoints
- [ ] Deploy

### Testing
- [ ] Test ticket lookup with valid ID
- [ ] Test ticket lookup with invalid ID
- [ ] Test complaint with valid data
- [ ] Test complaint with wrong email
- [ ] Test rate limiting
- [ ] Verify admin email delivery
- [ ] Verify customer confirmation email
- [ ] Test mobile responsiveness

---

## 📞 Customer Journey

1. **Customer receives ticket confirmation email**
   - Contains ticket ID: `TICK-20250116-ABC123`
   - Link to track: `https://support.3vltn.com/track`

2. **Customer checks status**
   - Visits `/track`
   - Enters ticket ID
   - Sees current status

3. **If taking too long (>2 days)**
   - System shows complaint option
   - Customer clicks "File Complaint"
   - Redirects to `/complaint?ticket=TICK-20250116-ABC123`

4. **Customer files complaint**
   - Fills in details
   - Submits form
   - Receives confirmation email
   - Admin receives complaint email

5. **Management responds**
   - Admin sees complaint
   - Takes action
   - Updates ticket
   - Responds to customer

---

## 🎯 Next Steps

1. **Backend Developer:**
   - Read `CUSTOMER_PORTAL_BACKEND.md`
   - Implement two API endpoints
   - Create database table
   - Set up email templates
   - Deploy to production

2. **Testing:**
   - Test all scenarios
   - Verify email delivery
   - Check rate limiting
   - Validate security

3. **Launch:**
   - Update customer email templates to include tracking link
   - Add tracking link to website footer
   - Train support team
   - Monitor complaints

---

**Everything is ready to go! Just need the backend APIs implemented.** 🚀

Questions? Let me know!

