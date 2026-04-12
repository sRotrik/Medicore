const emailService = require('./src/services/email.service');

async function testEmails() {
    console.log("Starting email test...");

    const testEmailAddress = "medsmart04@gmail.com"; // Sending an email to itself to prevent spam
    const testPatientName = "Test User";

    const testMedication = {
        name: "Amoxicillin (Test)",
        qtyPerDose: 1,
        scheduledTime: "14:30",
        mealType: "after_meal",
        remainingQty: 8,
        remarks: "Test remark for automated email."
    };

    console.log(`\n1. Testing Medication Reminder...`);
    const reminderRes = await emailService.sendMedicationReminder(testEmailAddress, testPatientName, testMedication);
    
    if (reminderRes.success) {
        console.log("✅ Custom Email service connection is WORKING properly!");
        console.log("Message ID:", reminderRes.messageId);
    } else {
        console.log("❌ Email service connection FAILED.");
        console.log("Error details:", reminderRes.error);
    }

    process.exit(0);
}

testEmails();
