// Test patient login and medication list
const fetch = require('node-fetch');

async function testPatientMedications() {
    try {
        console.log('🔐 Step 1: Login as testpatient1...\n');

        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testpatient1@medicore.com',
                password: 'Patient@123',
                role: 'patient'
            })
        });

        const loginData = await loginResponse.json();

        if (!loginData.success) {
            console.error('❌ Login failed:', loginData.message);
            return;
        }

        console.log(`✅ Login successful!`);
        console.log(`   Patient: ${loginData.user.full_name}`);
        console.log(`   ID: ${loginData.user.user_id}\n`);

        const token = loginData.accessToken;

        console.log('💊 Step 2: Fetch medications...\n');

        const medsResponse = await fetch('http://localhost:5000/api/patient/medications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Response status:', medsResponse.status);

        const medsData = await medsResponse.json();

        if (!medsData.success) {
            console.error('❌ Failed to fetch medications:', medsData.message);
            console.error('Full response:', JSON.stringify(medsData, null, 2));
            return;
        }

        console.log(`✅ Medications fetched successfully!`);
        console.log(`   Total medications: ${medsData.count}\n`);

        if (medsData.data && medsData.data.length > 0) {
            console.log('Medications:\n');
            medsData.data.forEach((med, idx) => {
                console.log(`${idx + 1}. ${med.name}`);
                console.log(`   Dosage: ${med.dosage}`);
                console.log(`   Time: ${med.time}`);
                console.log(`   Stock: ${med.stock}`);
                console.log(`   Active: ${med.isActive}`);
                console.log('');
            });
            console.log('🎉 SUCCESS! Patient can see medications.');
        } else {
            console.log('⚠️  No medications found for this patient.');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    }
}

testPatientMedications();
