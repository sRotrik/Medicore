const fetch = require('node-fetch');

async function testPatientMedicationsAPI() {
    try {
        console.log('🔐 Step 1: Login as testpatient1...\n');

        // Try different possible passwords
        const passwords = ['Patient@123', 'patient123', 'Test@123', 'testpatient1'];
        let loginData = null;
        let usedPassword = null;

        for (const password of passwords) {
            try {
                const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'testpatient1@medicore.com',
                        password: password,
                        role: 'patient'
                    })
                });

                const data = await loginResponse.json();
                if (data.success) {
                    loginData = data;
                    usedPassword = password;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!loginData) {
            console.error('❌ Could not login with any password');
            console.log('\nTried passwords:', passwords);
            console.log('\nPlease check what password was set for testpatient1');
            return;
        }

        console.log(`✅ Login successful with password: ${usedPassword}`);
        console.log(`   Patient: ${loginData.user.full_name}`);
        console.log(`   ID: ${loginData.user.user_id}\n`);

        const token = loginData.accessToken;

        console.log('💊 Step 2: Fetch medications from API...\n');

        const medsResponse = await fetch('http://localhost:5000/api/patient/medications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Response status:', medsResponse.status);

        const medsData = await medsResponse.json();

        console.log('\n📋 API Response:\n');
        console.log(JSON.stringify(medsData, null, 2));

        if (medsData.success) {
            console.log(`\n✅ API returned ${medsData.count} medications`);

            if (medsData.count > 0) {
                console.log('\n🎉 SUCCESS! Medications are being returned by the API.');
                console.log('\nIf they are not showing in the frontend, the issue is in the React component.');
            } else {
                console.log('\n⚠️  API returned 0 medications even though they exist in the database!');
                console.log('This is a backend issue.');
            }
        } else {
            console.log('\n❌ API returned error:', medsData.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    }
}

testPatientMedicationsAPI();
