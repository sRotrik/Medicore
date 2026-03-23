const fetch = require('node-fetch');

async function testPatientMedicationsComplete() {
    try {
        console.log('🔐 Step 1: Login as testpatient1...\n');

        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testpatient1@medicore.com',
                password: 'Testpatient1@123',
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

        console.log('💊 Step 2: Fetch medications from API...\n');

        const medsResponse = await fetch('http://localhost:5000/api/patient/medications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Response status:', medsResponse.status);

        const medsData = await medsResponse.json();

        console.log('\n📋 Full API Response:\n');
        console.log(JSON.stringify(medsData, null, 2));

        if (medsData.success) {
            console.log(`\n✅ API SUCCESS! Returned ${medsData.count} medications`);

            if (medsData.count > 0) {
                console.log('\n📊 Medication Details:\n');
                medsData.data.forEach((med, idx) => {
                    console.log(`${idx + 1}. ${med.name}`);
                    console.log(`   Time: ${med.time}`);
                    console.log(`   Dosage: ${med.dosage}`);
                    console.log(`   Stock: ${med.stock}`);
                    console.log(`   Meal Timing: ${med.mealTiming}`);
                    console.log(`   Expiry: ${med.expiryDate}`);
                    console.log('');
                });
                console.log('🎉 SUCCESS! The backend API is working correctly!');
                console.log('\nIf medications are not showing in the frontend:');
                console.log('1. Refresh the browser (Ctrl + F5)');
                console.log('2. Clear browser cache');
                console.log('3. Check browser console for errors');
            } else {
                console.log('\n⚠️  API returned 0 medications');
            }
        } else {
            console.log('\n❌ API Error:', medsData.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    }
}

testPatientMedicationsComplete();
