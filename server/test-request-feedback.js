/**
 * Test requestHelperFeedback logic directly
 */
const { User, PatientHelper } = require('./src/models');
const feedbackService = require('./src/services/feedback.service');
const emailService    = require('./src/services/email.service');
const env = require('./src/config/env');

(async () => {
    try {
        const helperId = 10;

        console.log('Step 1: find helper...');
        const helper = await User.findOne({ where: { user_id: helperId, role: 'helper' } });
        console.log('Helper:', helper?.full_name);
        if (!helper) { console.log('NOT FOUND'); process.exit(1); }

        console.log('Step 2: find assignments...');
        const assignments = await PatientHelper.findAll({
            where: { helper_id: helperId, is_active: true },
            include: [{ model: User, as: 'patient', attributes: ['user_id', 'full_name', 'email'] }]
        });
        console.log('Assignments:', assignments.length);

        for (const assignment of assignments) {
            const patient = assignment.patient;
            console.log('Patient:', patient?.full_name, patient?.email);

            console.log('Step 3: createFeedbackRequest...');
            const token = feedbackService.createFeedbackRequest(
                patient.user_id, helper.user_id,
                patient.email, patient.full_name, helper.full_name
            );
            console.log('Token:', token);

            const feedbackUrl = `${env.FRONTEND_URL}/feedback/${token}`;
            console.log('URL:', feedbackUrl);

            console.log('Step 4: sending email...');
            await emailService.sendWeeklyFeedbackEmail(
                patient.email, patient.full_name, helper.full_name, feedbackUrl
            );
            console.log('Email sent OK');
        }

        console.log('\n✅ All steps passed');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ CRASH at step:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
})();
