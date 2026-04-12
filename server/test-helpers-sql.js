const { sequelize } = require('./src/config/database');

sequelize.query(`
    SELECT
        u.user_id, u.email, u.full_name, u.mobile, u.whatsapp,
        u.age, u.gender, u.verification_id, u.is_active,
        u.created_at,
        COUNT(ph.patient_id) AS assigned_patients
    FROM users u
    LEFT JOIN patient_helpers ph
        ON ph.helper_id = u.user_id AND ph.is_active = 1
    WHERE u.role = 'helper'
    GROUP BY u.user_id
    ORDER BY u.created_at DESC
`).then(([rows]) => {
    console.log('✅ Query OK, rows:', rows.length);
    rows.forEach(r => console.log(' -', r.full_name, '| assigned:', r.assigned_patients));
    process.exit(0);
}).catch(err => {
    console.error('❌ SQL ERROR:', err.message);
    process.exit(1);
});
