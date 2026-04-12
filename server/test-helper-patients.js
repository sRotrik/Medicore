// Test helper login and patient list
const fetch = require('node-fetch');

async function testHelperPatientList() {
    try {
        console.log('🔐 Step 1: Login as testhelper3...\n');

        // Find testhelper3 email first
        const helpers = [
            'testhelper3@medicore.com',
            'testhelper2@medicore.com'
        ];

        let loginData = null;
        let usedEmail = null;

        for (const email of helpers) {
            try {
                const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        password: 'Helper@123',
                        role: 'helper'
                    })
                });

                const data = await loginResponse.json();
                if (data.success) {
                    loginData = data;
                    usedEmail = email;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!loginData) {
            console.error('❌ Could not login with any test helper email');
            console.log('\nTrying to find helpers in database...');
            return;
        }

        console.log(`✅ Login successful with: ${usedEmail}`);
        console.log(`   Helper: ${loginData.user.full_name}`);
        console.log(`   ID: ${loginData.user.user_id}\n`);

        const token = loginData.accessToken;

        console.log('📋 Step 2: Fetch assigned patients...\n');

        const patientsResponse = await fetch('http://localhost:5000/api/helper/patients', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Response status:', patientsResponse.status);

        const patientsData = await patientsResponse.json();

        if (!patientsData.success) {
            console.error('❌ Failed to fetch patients:', patientsData.message);
            console.error('Full response:', JSON.stringify(patientsData, null, 2));
            return;
        }

        console.log(`✅ Patients fetched successfully!`);
        console.log(`   Total patients: ${patientsData.count}\n`);

        if (patientsData.data && patientsData.data.length > 0) {
            console.log('Assigned patients:\n');
            patientsData.data.forEach((patient, idx) => {
                console.log(`${idx + 1}. ${patient.full_name}`);
                console.log(`   ID: ${patient.user_id}`);
                console.log(`   Email: ${patient.email}`);
                console.log(`   Medications: ${patient.stats.medicationsToday}`);
                console.log(`   Appointments: ${patient.stats.upcomingAppointments}`);
                console.log('');
            });
            console.log('🎉 SUCCESS! Helper can see assigned patients.');
        } else {
            console.log('⚠️  No patients assigned to this helper.');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    }
}

testHelperPatientList();
