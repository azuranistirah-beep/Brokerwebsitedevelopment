# 🔍 AUTH DIAGNOSTIC TOOL - User Guide

## 🎯 **What is This Tool?**

The **Auth Diagnostic Tool** adalah tool untuk **troubleshoot login issues** secara otomatis. Tool ini akan:
- ✅ Check koneksi ke backend
- ✅ Verify apakah user exists
- ✅ Test login credentials
- ✅ Check account status (pending/active/rejected)
- ✅ Provide detailed error analysis
- ✅ Give actionable solutions

---

## 🚀 **How to Access:**

### **Method 1: Keyboard Shortcut (Recommended)**
```
Press: Ctrl + Shift + D (3 times dalam 2 detik)
```

**Example:**
```
Ctrl+Shift+D (press 1)
Ctrl+Shift+D (press 2)
Ctrl+Shift+D (press 3) → Tool opens!
```

### **Method 2: Direct URL** (If deployed)
```
https://investoft.netlify.app/?view=auth-diagnostic
```

---

## 📋 **How to Use:**

### **Step 1: Open the Tool**
- Press `Ctrl+Shift+D` 3 times
- Diagnostic tool page will open

### **Step 2: Enter Email**
- Enter the email address yang mengalami login issue
- Email ini akan dicheck di database

### **Step 3: (Optional) Enter Password**
- Jika ingin test login credentials, masukkan password
- Jika hanya ingin check apakah user exists, kosongkan password

### **Step 4: Run Diagnostics**
- Click "Run Diagnostics" button
- Tool akan run beberapa tests secara otomatis

### **Step 5: Review Results**
- Tool akan menampilkan hasil diagnostic
- Baca **Recommendation** di bagian atas
- Follow the action steps provided

---

## 🧪 **What Does It Test?**

### **Test 1: Backend Connection**
**Checks:** Apakah Edge Functions berjalan dengan baik?

**Possible Results:**
- ✅ **Success:** Backend connection OK
- ❌ **Error:** Cannot connect to backend
  - **Solution:** Deploy Edge Functions
  - **Command:** `supabase functions deploy make-server-20da1dab`

---

### **Test 2: User Existence Check**
**Checks:** Apakah user dengan email ini exists di Auth system?

**Possible Results:**
- ✅ **Success:** User found in Auth system
  - Shows: userId, email, confirmed status, created date
  - Shows: Profile data (name, role, status, balance)
- ❌ **Error:** User NOT found
  - **Solution:** User needs to Sign Up first

**⚠️ Warning:**
- User exists in Auth but no profile in database
  - **Cause:** Signup process incomplete
  - **Solution:** Contact admin to fix profile

---

### **Test 3: Login Credentials Test** (If password provided)
**Checks:** Apakah email + password combination valid?

**Possible Results:**
- ✅ **Success:** Login successful!
  - Shows: Session token (partial)
  - Proceeds to Test 4
- ❌ **Error:** Login failed
  - **"Invalid login credentials"**
    - Possible causes:
      1. Email or password incorrect
      2. User account doesn't exist
      3. Password was changed
    - **Solution:**
      1. Check spelling (CAPS LOCK)
      2. Sign Up if new user
      3. Contact admin for password reset

  - **"Email not confirmed"**
    - **Solution:** Contact admin to manually confirm email

---

### **Test 4: Profile & Status Check** (After successful login)
**Checks:** User profile data dan account status

**Possible Results:**
- ✅ **Success:** Profile loaded
  - Shows: Name, email, role, status, balance
  
  **Account Status:**
  - ✅ **Active:** Account is active - login should work!
  - ⚠️ **Pending:** Awaiting admin approval
    - **Solution:** Contact admin to approve account
  - ⚠️ **Rejected:** Account has been rejected
    - **Solution:** Contact admin/support for info

---

## 📊 **Understanding the Results:**

### **🟢 Green Card - Everything OK**
```
Title: Everything Looks Good!
Priority: Low
Action: Try logging in normally
```

**What to do:**
- Your account is active and credentials are correct
- If still can't login, clear browser cache
- Try incognito mode

---

### **🟡 Yellow Card - Needs Attention**
```
Title: Account Pending Approval
Priority: Medium
Action: Wait for admin approval or contact support
```

**What to do:**
- Your credentials are correct
- Account exists but pending admin approval
- Wait for approval email or contact admin

---

### **🔴 Red Card - Action Required**
```
Title: User Account Not Found
Priority: High
Action: Please Sign Up first
```

**What to do:**
- Email not registered in system
- Go to Login → Sign Up tab
- Create new account

---

## 🎯 **Common Scenarios:**

### **Scenario 1: "I can't login"**

**Steps:**
1. Press `Ctrl+Shift+D` (3x)
2. Enter your email
3. Enter your password
4. Click "Run Diagnostics"

**Result Interpretation:**
- **User not found** → Sign up first
- **Invalid credentials** → Check password
- **Account pending** → Wait for admin approval
- **Account active** → Clear cache and try again

---

### **Scenario 2: "I signed up but can't login"**

**Steps:**
1. Run diagnostic with your email (no password needed)
2. Check "User Existence" result

**Possible Issues:**
- **User exists, status: pending** → Normal! Wait for admin approval
- **User exists, status: rejected** → Contact admin
- **User not found** → Signup may have failed, try again

---

### **Scenario 3: "I forgot my password"**

**Steps:**
1. Run diagnostic with email only
2. Verify user exists
3. Contact admin for password reset

**Don't:**
- Don't try to login multiple times (account may get locked)
- Don't create multiple accounts with same email

---

## 💾 **Exporting Results:**

### **For Support/Admin:**

1. Scroll to bottom of results
2. Find "Raw Diagnostic Data" section
3. Click "Copy to Clipboard"
4. Send to support/admin

**What to Include:**
```
Subject: Login Issue - Need Help

Hello,

I'm unable to login with email: [your-email@example.com]

Diagnostic Results:
[Paste the copied JSON data here]

Please help me resolve this.

Thanks,
[Your Name]
```

---

## 🔐 **Privacy & Security:**

### **Is My Password Safe?**
✅ **YES!** Your password is:
- Only tested against Supabase Auth (secure)
- NOT sent to any external server
- NOT stored anywhere
- Automatically signed out after test

### **What Data is Collected?**
- Email address
- Login attempt results
- Account status
- No sensitive data is stored

### **Can Admin See My Password?**
❌ **NO!** Admin can:
- See your email
- See your account status
- See diagnostic results
- **CANNOT** see your password

---

## 🛠️ **For Admins:**

### **When Member Sends Diagnostic Report:**

1. **Review the JSON data**
   - Check `steps` array for test results
   - Look at `recommendation` for quick summary

2. **Identify the Issue**
   - User not found → Guide them to signup
   - Pending status → Approve account
   - Invalid credentials → Reset password
   - Backend error → Check Edge Functions

3. **Take Action**
   - Approve/reject account if pending
   - Reset password if forgotten
   - Fix backend if error
   - Send confirmation to member

---

## 📖 **Reading the JSON Output:**

```json
{
  "timestamp": "2026-02-07T10:30:00Z",
  "email": "user@example.com",
  "steps": [
    {
      "name": "Supabase Connection",
      "status": "success",  // ← success/error/testing
      "message": "✅ Backend connection successful"
    },
    {
      "name": "User Existence Check",
      "status": "success",
      "data": {
        "userId": "abc-123",
        "email": "user@example.com",
        "confirmed": "Yes"
      },
      "profile": {
        "name": "John Doe",
        "role": "member",
        "status": "pending"  // ← This is KEY!
      }
    }
  ],
  "recommendation": {
    "title": "Account Pending Approval",
    "message": "Credentials correct, waiting for admin",
    "action": "Contact admin to approve",
    "priority": "medium"
  }
}
```

**Key Fields:**
- `status`: success/error/testing
- `profile.status`: pending/active/rejected ← **Most important!**
- `recommendation`: What to do next

---

## 🚨 **Troubleshooting the Tool Itself:**

### **Tool won't open:**
- Try refreshing page (F5)
- Clear browser cache
- Use incognito mode
- Check console (F12) for errors

### **"Cannot connect to backend" error:**
- Edge Functions may not be deployed
- Check Supabase status: https://status.supabase.com
- Contact developer

### **Results don't make sense:**
- Copy JSON data
- Contact support with full details
- Include screenshot

---

## 📞 **Getting Help:**

### **For Users:**
1. Run diagnostic tool
2. Copy results
3. Email: support@investoft.com
4. Include screenshot + JSON data

### **For Admins:**
1. Review diagnostic data sent by user
2. Follow admin guide: [ADMIN_MEMBER_LOGIN_HELP.md](./ADMIN_MEMBER_LOGIN_HELP.md)
3. Escalate to developer if backend issue

---

## ✅ **Success Checklist:**

After using the tool, you should know:

- [ ] Does my account exist? (Yes/No)
- [ ] Is my password correct? (Yes/No)
- [ ] What is my account status? (pending/active/rejected)
- [ ] What should I do next? (Clear action from recommendation)
- [ ] Do I need admin help? (Yes/No)

---

## 🎯 **Quick Reference:**

| Issue | Diagnostic Result | Solution |
|-------|-------------------|----------|
| User not found | ❌ User NOT found | Sign Up first |
| Wrong password | ❌ Invalid credentials | Check password / Reset |
| Account pending | ⚠️ Status: pending | Wait for admin approval |
| Account rejected | ⚠️ Status: rejected | Contact admin |
| Account active | ✅ Status: active | Clear cache, try login |
| Backend down | ❌ Cannot connect | Check Edge Functions |

---

## 🎓 **Best Practices:**

### **Do:**
- ✅ Run diagnostic before contacting support
- ✅ Copy full JSON results when asking for help
- ✅ Check recommendation carefully
- ✅ Follow suggested actions

### **Don't:**
- ❌ Don't share your password with anyone
- ❌ Don't run diagnostic repeatedly (once is enough)
- ❌ Don't ignore the recommendation
- ❌ Don't create multiple accounts

---

## 🚀 **Summary:**

**Auth Diagnostic Tool** = **Self-Service Login Troubleshooting**

1. **Access:** `Ctrl+Shift+D` (3x)
2. **Enter:** Email (+ password if testing login)
3. **Run:** Click "Run Diagnostics"
4. **Review:** Read recommendation
5. **Action:** Follow the suggested steps
6. **Support:** Copy JSON if need help

**Most common fix:** Account pending → Wait for admin approval!

---

**Tool Status:** ✅ **Production Ready**

**Keyboard Shortcut:** `Ctrl+Shift+D` (3x)

**Access Level:** Everyone (public tool)

**Last Updated:** February 7, 2026
