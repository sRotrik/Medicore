// Quick script to test admin login and patient detail API
const fetch = require('node-fetch');

async function testAdminPatientAPI() {
    try {
        console.log('🔐 Step 1: Login as admin...\n');

        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@medicore.com',
                password: 'Admin@123',
                role: 'admin'
            })
        });

        const loginData = await loginResponse.json();

        if (!loginData.success) {
            console.error('❌ Login failed:', loginData.message);
            return;
        }

        console.log('✅ Login successful!');
        console.log('   Token:', loginData.accessToken.substring(0, 20) + '...');

        const token = loginData.accessToken;

        console.log('\n📋 Step 2: Fetch patient list...\n');

        const patientsResponse = await fetch('http://localhost:5000/api/admin/patients', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const patientsData = await patientsResponse.json();

        if (!patientsData.success) {
            console.error('❌ Failed to fetch patients:', patientsData.message);
            return;
        }

        console.log('✅ Patients fetched successfully!');
        console.log(`   Total patients: ${patientsData.patients.length}\n`);

        if (patientsData.patients.length > 0) {
            const patient = patientsData.patients[0];
            console.log('First patient:');
            console.log('   ID:', patient.id);
            console.log('   user_id:', patient.user_id);
            console.log('   Name:', patient.fullName);
            console.log('   Email:', patient.email);

            const patientId = patient.id || patient.user_id;

            console.log(`\n🔍 Step 3: Fetch patient detail for ID: ${patientId}...\n`);

            const detailResponse = await fetch(`http://localhost:5000/api/admin/patients/${patientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Response status:', detailResponse.status);

            const detailData = await detailResponse.json();

            if (detailData.success) {
                console.log('✅ Patient detail fetched successfully!');
                console.log('   Name:', detailData.patient.fullName);
                console.log('   Medications:', detailData.patient.stats.totalMedications);
                console.log('   Appointments:', detailData.patient.stats.totalAppointments);
                console.log('\n🎉 ALL TESTS PASSED! The API is working correctly.');
            } else {
                console.log('❌ Patient detail fetch failed!');
                console.log('   Error:', detailData.message);
                console.log('   Full response:', JSON.stringify(detailData, null, 2));
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    }
}

testAdminPatientAPI();
