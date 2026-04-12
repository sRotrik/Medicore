require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { User, PatientHelper } = require('./src/models');

async function checkHelperAssignments() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Find testhelper3
        const helper = await User.findOne({
            where: {
                email: { [sequelize.Sequelize.Op.like]: '%testhelper3%' },
                role: 'helper'
            }
        });

        if (!helper) {
            console.log('❌ testhelper3 not found. Let me check all helpers:\n');
            const allHelpers = await User.findAll({
                where: { role: 'helper' },
                attributes: ['user_id', 'email', 'full_name']
            });

            console.log('Available helpers:');
            allHelpers.forEach(h => {
                console.log(`  - ID: ${h.user_id} | Email: ${h.email} | Name: ${h.full_name}`);
            });

            await sequelize.close();
            process.exit(0);
            return;
        }

        console.log(`Found helper: ${helper.full_name} (${helper.email})`);
        console.log(`Helper ID: ${helper.user_id}\n`);

        // Check patient assignments
        console.log('Checking patient assignments...\n');

        const assignments = await PatientHelper.findAll({
            where: { helper_id: helper.user_id },
            include: [{
                model: User,
                as: 'patient',
                attributes: ['user_id', 'full_name', 'email', 'age', 'gender', 'mobile']
            }]
        });

        console.log(`Total assignments: ${assignments.length}`);

        if (assignments.length === 0) {
            console.log('\n❌ No patients assigned to this helper!');
            console.log('\nLet me check all patient-helper relationships:\n');

            const [allAssignments] = await sequelize.query(`
                SELECT 
                    ph.assignment_id,
                    ph.patient_id,
                    ph.helper_id,
                    ph.is_active,
                    p.full_name as patient_name,
                    h.full_name as helper_name
                FROM patient_helpers ph
                LEFT JOIN users p ON ph.patient_id = p.user_id
                LEFT JOIN users h ON ph.helper_id = h.user_id
                ORDER BY ph.created_at DESC
                LIMIT 10
            `);

            console.log('Recent assignments:');
            allAssignments.forEach(a => {
                console.log(`  Patient: ${a.patient_name} (ID: ${a.patient_id}) → Helper: ${a.helper_name} (ID: ${a.helper_id}) | Active: ${a.is_active}`);
            });
        } else {
            console.log('\n✅ Assigned patients:\n');
            assignments.forEach((assignment, idx) => {
                console.log(`${idx + 1}. ${assignment.patient.full_name}`);
                console.log(`   Patient ID: ${assignment.patient.user_id}`);
                console.log(`   Email: ${assignment.patient.email}`);
                console.log(`   Active: ${assignment.is_active}`);
                console.log('');
            });
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

checkHelperAssignments();
