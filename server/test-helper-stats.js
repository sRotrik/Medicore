const { User, MedicationLog, PatientHelper } = require('./src/models');
const { Op } = require('sequelize');
const { sequelize } = require('./src/config/database');

(async () => {
  try {
    const helpers = await User.findAll({
      where: { role: 'helper' },
      attributes: { exclude: ['password_hash'] }
    });
    console.log('Helpers found:', helpers.length);

    for (const helper of helpers) {
      const hid = helper.user_id;
      const assignedPatients = await PatientHelper.count({ where: { helper_id: hid, is_active: true } });
      const relations = await PatientHelper.findAll({
        where: { helper_id: hid, is_active: true },
        attributes: ['patient_id']
      });
      const patientIds = relations.map(r => r.patient_id);

      let tasksCompleted = 0, performanceScore = 0;
      if (patientIds.length > 0) {
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart); todayEnd.setDate(todayEnd.getDate() + 1);

        tasksCompleted = await MedicationLog.count({
          where: {
            patient_id: { [Op.in]: patientIds },
            taken_time: { [Op.gte]: todayStart, [Op.lt]: todayEnd }
          }
        });

        const [rows] = await sequelize.query(
          `SELECT COUNT(*) AS total,
                  SUM(CASE WHEN status IN ('on_time','early') THEN 1 ELSE 0 END) AS good
           FROM medication_logs
           WHERE patient_id IN (:ids)
             AND taken_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
          { replacements: { ids: patientIds } }
        );
        const total = parseInt(rows[0]?.total || 0);
        const good  = parseInt(rows[0]?.good  || 0);
        performanceScore = total > 0 ? Math.round((good / total) * 100) : 0;
      }

      console.log(helper.full_name, '-> assigned:', assignedPatients, 'tasks:', tasksCompleted, 'perf%:', performanceScore);
    }

    process.exit(0);
  } catch (err) {
    console.error('CRASH:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();
