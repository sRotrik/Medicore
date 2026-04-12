# 📧 Email Notification System - Complete Guide

## ✅ **Email Notifications Implemented!**

Your MediCore platform now has a complete email notification system with beautiful HTML templates and automated scheduling!

---

## 🎯 **Features Implemented**

### **1. Email Service (`email.service.js`)**
- ✅ Welcome email on signup
- ✅ Medication reminders (30 min before)
- ✅ Appointment reminders (24 hours before)
- ✅ Medication taken confirmation
- ✅ Low stock alerts
- ✅ Helper assignment notifications

### **2. Automated Scheduler (`scheduler.js`)**
- ✅ Medication reminders every 15 minutes
- ✅ Appointment reminders every hour
- ✅ Low stock check daily at 9 AM
- ✅ Auto-mark missed appointments every hour

---

## 📧 **Email Types**

### **1. Welcome Email**
**Sent when:** Patient signs up
**Template:** Beautiful gradient header with welcome message
**Content:**
- Welcome message
- Platform features
- Link to dashboard

### **2. Medication Reminder**
**Sent when:** 30 minutes before scheduled time
**Template:** Green gradient with medication card
**Content:**
- Medication name
- Dosage
- Scheduled time
- Meal type
- Remaining quantity
- Link to mark as taken

### **3. Appointment Reminder**
**Sent when:** 24 hours before appointment
**Template:** Pink gradient with appointment card
**Content:**
- Doctor name
- Date and time
- Location
- Contact number
- Reminder to arrive early

### **4. Medication Taken Confirmation**
**Sent when:** Patient marks medication as taken
**Template:** Success theme with green accents
**Content:**
- Medication name
- Taken time
- Status (On Time/Late/Early)
- Delay minutes
- Remaining quantity

### **5. Low Stock Alert**
**Sent when:** Medication quantity ≤ 5 doses
**Template:** Warning theme with yellow accents
**Content:**
- Medication name
- Remaining quantity
- Daily dosage
- Refill reminder

### **6. Helper Assignment**
**Sent when:** Helper is assigned to patient
**Template:** Purple gradient
**Content:**
- Helper name
- Helper permissions
- Support message

---

## ⏰ **Automated Schedules**

### **Medication Reminders**
- **Frequency:** Every 15 minutes
- **Logic:** Checks medications scheduled 30 minutes from now
- **Conditions:**
  - Medication is active
  - Not already taken today
  - Patient has email

### **Appointment Reminders**
- **Frequency:** Every hour
- **Logic:** Checks appointments 24 hours ahead
- **Conditions:**
  - Status is "scheduled"
  - Reminder not yet sent
  - Patient has email

### **Low Stock Check**
- **Frequency:** Daily at 9:00 AM
- **Logic:** Finds medications with ≤ 5 doses
- **Conditions:**
  - Medication is active
  - Remaining quantity > 0 and ≤ 5

### **Missed Appointments**
- **Frequency:** Every hour
- **Logic:** Marks past appointments as missed
- **Conditions:**
  - Status is "scheduled"
  - Date is in the past

---

## 🔧 **Configuration**

### **Environment Variables (.env)**

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=MediCore <noreply@medicore.com>

# Notification Settings
MEDICATION_REMINDER_MINUTES=30
APPOINTMENT_REMINDER_HOURS=24

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

---

## 📝 **Setup Gmail for Sending Emails**

### **Step 1: Enable 2-Step Verification**
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the setup process

### **Step 2: Generate App Password**
1. Go to https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other (Custom name)"
4. Enter: "MediCore"
5. Click "Generate"
6. **Copy the 16-character password**

### **Step 3: Update .env File**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-character password
```

---

## 🧪 **Testing Email Notifications**

### **Test 1: Welcome Email**
```bash
# Signup a new patient
curl -X POST http://localhost:5000/api/auth/signup/patient \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "age": 30,
    "gender": "Male",
    "contactNumber": "9876543210"
  }'
```

**Expected:** Welcome email sent to test@example.com

---

### **Test 2: Medication Reminder**

**Manual Test:**
```javascript
// In Node.js console or test file
const emailService = require('./src/services/email.service');

emailService.sendMedicationReminder(
  'test@example.com',
  'John Doe',
  {
    name: 'Aspirin',
    qtyPerDose: 1,
    scheduledTime: '08:00',
    mealType: 'After Meal',
    remainingQty: 29,
    remarks: 'Take with water'
  }
);
```

**Automated Test:**
- Add a medication scheduled 30 minutes from now
- Wait for the scheduler to run (every 15 min)
- Check your email

---

### **Test 3: Low Stock Alert**

```javascript
// Set a medication to low stock
const { Medication } = require('./src/models');

// Find a medication and update
await Medication.findByIdAndUpdate(medicationId, {
  remainingQty: 3
});

// Manually trigger low stock check
const { checkLowStockMedications } = require('./src/jobs/scheduler');
await checkLowStockMedications();
```

---

## 📊 **Email Templates**

All emails use beautiful HTML templates with:
- ✅ Responsive design
- ✅ Gradient headers
- ✅ Professional styling
- ✅ Call-to-action buttons
- ✅ Footer with branding

### **Color Schemes:**
- **Welcome:** Purple gradient (#667eea → #764ba2)
- **Medication:** Green gradient (#11998e → #38ef7d)
- **Appointment:** Pink gradient (#f093fb → #f5576c)
- **Low Stock:** Yellow warning (#ffc107)

---

## 🔄 **How It Works**

### **1. Server Startup**
```
server.js
  ↓
initializeScheduler()
  ↓
Cron jobs start running
```

### **2. Medication Reminder Flow**
```
Every 15 minutes
  ↓
checkMedicationReminders()
  ↓
Find medications scheduled in 30 min
  ↓
Check if not taken today
  ↓
Get patient email
  ↓
sendMedicationReminder()
  ↓
Email sent via Nodemailer
```

### **3. Appointment Reminder Flow**
```
Every hour
  ↓
checkAppointmentReminders()
  ↓
Find appointments in next 24 hours
  ↓
Check if reminder not sent
  ↓
Get patient email
  ↓
sendAppointmentReminder()
  ↓
Mark reminderSent = true
  ↓
Email sent
```

---

## 📈 **Monitoring**

### **Console Logs:**
```
🔔 Checking medication reminders...
Found 3 medications to remind
Sending medication reminder to patient@example.com for Aspirin
✅ Email sent to patient@example.com: <message-id>
✅ Medication reminders checked
```

### **Error Handling:**
- ❌ Email send failures are logged but don't crash the server
- ❌ Scheduler errors are caught and logged
- ❌ Invalid email addresses are skipped

---

## 🚀 **Production Deployment**

### **For Production:**

1. **Use a Professional Email Service:**
   - SendGrid (recommended)
   - Mailgun
   - Amazon SES
   - Postmark

2. **Update Configuration:**
```env
EMAIL_SERVICE=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

3. **Set Up Domain:**
   - Use your own domain for emails
   - Set up SPF, DKIM, DMARC records
   - Verify domain with email service

---

## 📋 **Checklist**

### **Setup:**
- [ ] Gmail 2-Step Verification enabled
- [ ] App password generated
- [ ] .env file updated with email credentials
- [ ] Server restarted

### **Testing:**
- [ ] Welcome email works
- [ ] Medication reminder works
- [ ] Appointment reminder works
- [ ] Low stock alert works
- [ ] Emails look good on mobile
- [ ] Links in emails work

### **Production:**
- [ ] Professional email service configured
- [ ] Domain verified
- [ ] Email templates reviewed
- [ ] Unsubscribe link added (optional)
- [ ] Email analytics set up (optional)

---

## 🎨 **Customization**

### **Change Reminder Times:**

In `.env`:
```env
MEDICATION_REMINDER_MINUTES=60  # 1 hour before
APPOINTMENT_REMINDER_HOURS=48   # 2 days before
```

### **Change Scheduler Frequency:**

In `src/jobs/scheduler.js`:
```javascript
// Every 30 minutes instead of 15
cron.schedule('*/30 * * * *', () => {
    checkMedicationReminders();
});
```

### **Customize Email Templates:**

Edit `src/services/email.service.js`:
```javascript
const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      /* Your custom styles */
    </style>
  </head>
  <body>
    <!-- Your custom template -->
  </body>
  </html>
`;
```

---

## 🐛 **Troubleshooting**

### **Issue 1: Emails Not Sending**

**Check:**
1. Email credentials in `.env`
2. App password (not regular password)
3. Internet connection
4. Console logs for errors

**Solution:**
```bash
# Test email configuration
node -e "require('./src/services/email.service').sendEmail({
  to: 'test@example.com',
  subject: 'Test',
  html: '<h1>Test Email</h1>'
})"
```

---

### **Issue 2: Scheduler Not Running**

**Check:**
1. Server logs for scheduler initialization
2. Cron job syntax
3. Server timezone

**Solution:**
```javascript
// Manually trigger
const { checkMedicationReminders } = require('./src/jobs/scheduler');
checkMedicationReminders();
```

---

### **Issue 3: Gmail Blocking Emails**

**Error:** "Less secure app access"

**Solution:**
- Use App Password (not regular password)
- Enable 2-Step Verification
- Or use a different email service

---

## ✅ **Email Notifications Complete!**

**Status:** ✅ Fully functional email notification system

**Features:**
- ✅ 6 email types with beautiful templates
- ✅ 4 automated schedulers
- ✅ Professional HTML design
- ✅ Error handling
- ✅ Production-ready

**Ready to send emails!** 📧

---

**Need help?** Check the troubleshooting section or test manually! 🚀
