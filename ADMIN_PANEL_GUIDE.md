# 🎯 INVESTOFT - SUPER ADMIN PANEL GUIDE

## 🚀 Overview

Super Admin Panel yang comprehensive dengan layout professional seperti OlympTrade, fokus pada kontrol user, transaksi, dan verifikasi.

---

## 📐 LAYOUT STRUCTURE

### **Sidebar Kiri** (Collapsible)
- Ikon + Label untuk setiap menu
- Badge notification untuk item yang pending
- Dapat di-collapse untuk lebih banyak space
- Sticky di kiri dengan scroll independent

### **Topbar**
- Search global (members, transactions, tickets)
- Notification bell dengan badge counter
- Quick Actions dropdown
- Admin profile dropdown

### **Main Content Area**
- Card-based statistics
- Professional tables dengan actions
- Modal dialogs untuk detail view
- Responsive layout

---

## 🗂️ MENU STRUCTURE

### **1. Overview** ✅ COMPLETED
**Features:**
- 5 Stats Cards:
  - Total Members
  - Pending KYC (with urgent badge)
  - Today Deposits
  - Today Withdrawals (with urgent badge)
  - Open Trades
  
- 3 Queue Widgets:
  - Pending Members (with quick approve button)
  - Pending KYC (with quick review button)
  - Pending Withdrawals (with quick process button)
  
- Latest Activity Table:
  - Shows last 20 activities
  - Real-time updates
  - Status badges (completed, pending, active, info)
  - Types: deposit, trade, KYC, withdrawal, login

**Quick Actions:**
- Click on "View All →" to navigate to specific page
- Navigate from queue widgets directly

---

### **2. Members** ✅ COMPLETED
**Submenu:**
- All Members
- Pending Approval
- Blocked Members

**Features:**
- Search & Filter:
  - By name, email, ID
  - Status filter
  - Country filter
  - KYC status filter
  - Date range filter

- Member Table Columns:
  - Member info (name, email)
  - Country
  - Status (active/pending/blocked)
  - KYC Status (approved/pending/rejected/not submitted)
  - Balance (real-time)
  - Registered date
  - Last login
  - Actions dropdown

- Actions per Member:
  - **View Details** - Full profile modal
  - **Approve** (for pending members)
  - **Block/Unblock** user
  - **Reset Password** - Generate link
  - **Adjust Balance** - Credit/Debit dengan reason

**Member Detail Modal:**
- Complete profile information
- KYC status with badge
- Current balance
- Registration date
- Last login time
- Quick action buttons:
  - Edit Profile
  - View Trades
  - View Transactions

**Adjust Balance Modal:**
- Current balance display
- Amount input (+ for credit, - for debit)
- Reason field (required)
- Apply adjustment button

---

### **3. KYC Verification** ✅ COMPLETED
**Submenu:**
- Pending (priority)
- Approved
- Rejected

**Features:**
- KYC Queue Table:
  - Member info
  - Country
  - Document type (Passport, Driver License, National ID)
  - Submitted date
  - Status
  - Review/View button

**Review KYC Modal:**
- Member Information Card:
  - Full name
  - Email
  - Country
  - Document type

- Document Preview (3 images):
  - ID Card - Front (clickable to enlarge)
  - ID Card - Back (clickable to enlarge)
  - Selfie with ID (clickable to enlarge)
  - Hover effect untuk preview
  - Click untuk full-size view

- Rejection Reason Dropdown:
  - Document is blurry or unreadable
  - Document has expired
  - Name doesn't match account name
  - Suspected fake or edited document
  - Selfie doesn't match ID photo
  - Document type not accepted
  - Other (specify below) - shows textarea

- Actions:
  - **Approve KYC** (green button)
  - **Reject KYC** (red button, disabled until reason selected)

- Status Display:
  - Shows rejection reason for already rejected KYCs
  - Color-coded status cards

---

### **4. Deposits** 🚧 PLACEHOLDER
**Planned Features:**
- All Deposits
- Pending/Processing
- Completed
- Failed

**Planned Actions:**
- Mark as completed (manual)
- Refund/Cancel
- Export CSV
- View transaction details
- Filter by payment method
- Date range filter

---

### **5. Withdrawals** ✅ COMPLETED
**Submenu:**
- Pending (priority)
- Approved
- Rejected

**Features:**
- Stats Cards:
  - Pending count
  - Total pending amount

- Withdrawal Table:
  - Request ID
  - Member info
  - Amount (gross, fee, net)
  - Payment method
  - KYC status
  - Status
  - Request date
  - Actions

**Process Withdrawal Modal:**
- Withdrawal Info Card:
  - Request ID
  - Status badges
  - Member info
  - KYC status
  - Amount breakdown:
    - Gross amount
    - Processing fee
    - Net payout (highlighted in green)

- Payment Details Card:
  - Method (Bank Transfer, Crypto, E-wallet)
  - Bank name (for bank transfers)
  - Account number (masked)
  - Account name
  - Wallet address (for crypto)
  - Wallet ID (for e-wallets)

- KYC Warning:
  - Yellow alert if KYC not approved
  - Suggestion to review KYC first

- Actions for Pending:
  - Rejection reason dropdown
  - Custom reason textarea
  - **Approve & Process** button
  - **Reject Request** button

- Actions for Approved:
  - Proof of Payment input
  - Mark as Paid button

- Rejection Display:
  - Shows rejection reason for rejected withdrawals

---

### **6. Trades** 🚧 PLACEHOLDER
**Planned Features:**
- Open Trades
- Closed Trades
- Disputes

**Planned Actions:**
- Monitor positions
- View P/L
- Force close (emergency)
- View trade details
- Filter by instrument
- Date range filter

---

### **7. Assets** 🚧 PLACEHOLDER
**Planned Features:**
- Instruments List
- Payout Settings

**Planned Actions:**
- Add/Edit asset
- Enable/Disable asset
- Set payout percentage
- Configure timeframes
- Asset categories (Forex, Crypto, Stock, OTC)

---

### **8. Promotions** 🚧 PLACEHOLDER
**Planned Features:**
- Bonuses Management
- Promo Codes

**Planned Actions:**
- Create promo code
- Set bonus value
- Define requirements
- Set expiry date
- Enable/Disable promo
- View usage history

---

### **9. Support** 🚧 PLACEHOLDER
**Planned Features:**
- Tickets List
- Live Chat (optional)

**Planned Actions:**
- View ticket list
- Assign to admin
- Template responses
- Conversation log
- Status updates

---

### **10. Reports** 🚧 PLACEHOLDER
**Planned Features:**
- Finance Summary (deposit/withdraw/net)
- User Growth
- Trading Volume
- KYC Stats

**Planned Actions:**
- Date range filter
- Export CSV/PDF
- Generate reports
- View charts

---

### **11. Settings** 🚧 PLACEHOLDER
**Planned Features:**
- Admin Roles & Permissions
- Website Settings
- Security (2FA, IP whitelist)
- Payment Methods Config
- Notification Settings

**Role Types:**
- Super Admin: Full access
- Finance Admin: Deposits/Withdrawals + Finance reports
- KYC Admin: KYC verification only
- Support Admin: Tickets only
- Content Admin: Promotions/Assets

---

## 🔔 NOTIFICATION SYSTEM

**Topbar Notifications (Bell Icon):**
- New member registration pending
- New KYC submitted
- Withdrawal request pending
- Deposit failed (optional)
- High risk flag (optional)

**Features:**
- Unread count badge
- Dropdown list with:
  - Notification text
  - Time ago
  - Unread indicator (blue dot)
  - Click to view details
- "View all notifications" link

---

## ⚡ QUICK ACTIONS (Topbar Dropdown)

**Available Actions:**
1. Approve Member → Navigate to Members pending
2. Approve KYC → Navigate to KYC pending
3. Approve Withdrawal → Navigate to Withdrawals pending
4. Add Asset → Navigate to Assets
5. Create Promo → Navigate to Promotions

---

## 🎨 DESIGN SYSTEM

**Color Palette:**
- Background: `slate-950`, `slate-900`, `slate-800`
- Border: `slate-800`, `slate-700`
- Text: `white`, `gray-400`, `gray-300`
- Primary: `purple-600`, `purple-700`
- Success: `green-600`, `green-500/20`
- Warning: `yellow-500/20`
- Danger: `red-600`, `red-500/20`
- Info: `blue-500/20`

**Typography:**
- Headings: Bold, white
- Body: Regular, gray-300
- Muted: gray-400
- Monospace: For IDs, amounts

**Components:**
- Cards with subtle shadow
- Rounded corners (lg, md)
- Hover effects on interactive elements
- Smooth transitions
- Badge pills for status
- Icon + label buttons

---

## 🔐 SECURITY FEATURES

**Access Control:**
- Role-based permissions
- Admin-only routes
- Token validation
- Session management

**Audit Trail:**
- All admin actions logged
- Timestamp for every action
- Admin user attribution
- Reason fields for critical actions

---

## 📱 RESPONSIVE DESIGN

- Sidebar collapses on mobile
- Tables scroll horizontally
- Stats cards stack vertically
- Modal dialogs adapt to screen size
- Touch-friendly buttons

---

## 🚀 COMPLETED FEATURES

✅ **Layout:**
- Collapsible sidebar
- Professional topbar
- Notification system
- Quick actions

✅ **Pages:**
- Overview with stats & queues
- Members management (all features)
- KYC verification (full workflow)
- Withdrawals processing (complete)

✅ **Components:**
- Admin sidebar with navigation
- Admin topbar with search
- Stat cards
- Data tables
- Action modals
- Document preview
- Status badges

---

## 🚧 TODO - NEXT PHASES

**Phase 2:**
- [ ] Deposits management page
- [ ] Trades monitoring page
- [ ] Backend integration for all actions
- [ ] Real-time data updates

**Phase 3:**
- [ ] Assets management
- [ ] Promotions system
- [ ] Support tickets
- [ ] Reports & analytics

**Phase 4:**
- [ ] Settings page
- [ ] Admin roles management
- [ ] Advanced permissions
- [ ] Audit logs viewer

---

## 💾 BACKEND INTEGRATION NEEDED

**API Endpoints Required:**

### Members:
```
GET    /admin/members
GET    /admin/members/:id
POST   /admin/members/:id/approve
POST   /admin/members/:id/block
POST   /admin/members/:id/reset-password
POST   /admin/members/:id/adjust-balance
```

### KYC:
```
GET    /admin/kyc/pending
GET    /admin/kyc/:id
POST   /admin/kyc/:id/approve
POST   /admin/kyc/:id/reject
```

### Withdrawals:
```
GET    /admin/withdrawals
GET    /admin/withdrawals/:id
POST   /admin/withdrawals/:id/approve
POST   /admin/withdrawals/:id/reject
POST   /admin/withdrawals/:id/mark-paid
```

### Notifications:
```
GET    /admin/notifications
POST   /admin/notifications/:id/mark-read
```

---

## 📚 USAGE GUIDE

### **How to Access Admin Panel:**
1. Login dengan account yang memiliki `role = "admin"`
2. Akan auto-redirect ke Admin Dashboard
3. Sidebar navigation untuk switch between pages

### **How to Process KYC:**
1. Click "KYC Verification" di sidebar
2. Tab "Pending" akan show queue
3. Click "Review" pada member
4. View semua documents (click to enlarge)
5. Pilih action: Approve atau Reject
6. Jika reject, pilih reason dari dropdown
7. Submit decision

### **How to Process Withdrawal:**
1. Click "Withdrawals" di sidebar
2. Tab "Pending" akan show queue
3. Click "Process" pada request
4. Review amount, KYC status, payment details
5. Check KYC warning jika ada
6. Pilih action: Approve atau Reject
7. Jika reject, pilih reason
8. Jika approve, nanti bisa mark as paid dengan proof

### **How to Manage Members:**
1. Click "Members" di sidebar
2. Search atau filter members
3. Click actions dropdown pada member
4. Pilih action yang diinginkan
5. Complete dialog yang muncul

---

## 🎯 KEY FEATURES HIGHLIGHT

1. **Professional UI/UX** - Clean, modern, OlympTrade-style
2. **Comprehensive Management** - All aspects of platform
3. **Modular Design** - Easy to extend
4. **Real-time Updates** - Stats dan notifications
5. **Audit Trail** - Reason fields untuk actions
6. **Role-based Access** - Security first
7. **Responsive Layout** - Works on all devices
8. **Quick Actions** - Fast access to common tasks
9. **Smart Navigation** - Context-aware routing
10. **Document Preview** - Built-in image viewer

---

## 📞 SUPPORT

Untuk menambahkan fitur baru atau customize admin panel, refer to:
- `/src/app/components/admin/` - All admin components
- `/src/app/components/admin/pages/` - Individual page components
- `/src/app/components/NewAdminDashboard.tsx` - Main dashboard controller

---

**Version:** 1.0  
**Last Updated:** February 7, 2026  
**Status:** Phase 1 Complete ✅
