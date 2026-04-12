/**
 * Patient Score & Achievement Service
 * ─────────────────────────────────────────────────────────────
 *  Scoring weights (total = 100%)
 *    Medicine adherence (on_time + early)   : 35%
 *    Appointment attendance (completed)      : 25%
 *    Consistency streak                      : 20%
 *    Prescription records                    : 10%
 *    Feedback engagement (submitted reviews) : 10%
 *
 *  Visibility:
 *    patient  → full score + achievements
 *    helper   → achievements + stats only (no raw % credibility)
 *    admin    → everything including credibility %
 */

const { sequelize } = require('../config/database');
const fs   = require('fs');
const path = require('path');
const PRESCRIPTIONS_FILE = path.join(__dirname, '../../prescriptions.json');
const { getPatientFeedbackCount } = require('./feedback.service');

// ── Achievements definition ───────────────────────────────────────────────────
const ACHIEVEMENTS = [
    {
        id: 'first_med',
        icon: '💊',
        title: 'First Dose',
        desc: 'Took your very first medicine on time',
        tier: 'bronze',
        check: (stats) => stats.totalMedLogs >= 1
    },
    {
        id: 'week_streak',
        icon: '🔥',
        title: 'On Fire',
        desc: '7-day consecutive on-time medication streak',
        tier: 'silver',
        check: (stats) => stats.streak >= 7
    },
    {
        id: 'month_streak',
        icon: '⭐',
        title: 'Star Patient',
        desc: '30-day consecutive on-time medication streak',
        tier: 'gold',
        check: (stats) => stats.streak >= 30
    },
    {
        id: 'perfect_week',
        icon: '🎯',
        title: 'Perfect Week',
        desc: '100% medication adherence in the last 7 days',
        tier: 'silver',
        check: (stats) => stats.last7DayAdherence >= 100 && stats.totalMedLogs >= 7
    },
    {
        id: 'adherence_90',
        icon: '💪',
        title: 'Consistent',
        desc: 'Overall medication adherence above 90%',
        tier: 'gold',
        check: (stats) => stats.adherencePct >= 90 && stats.totalMedLogs >= 10
    },
    {
        id: 'first_appointment',
        icon: '📅',
        title: 'Punctual Planner',
        desc: 'Attended your first appointment',
        tier: 'bronze',
        check: (stats) => stats.completedAppointments >= 1
    },
    {
        id: 'five_appointments',
        icon: '🏥',
        title: 'Appointment Pro',
        desc: 'Attended 5 appointments',
        tier: 'silver',
        check: (stats) => stats.completedAppointments >= 5
    },
    {
        id: 'no_miss',
        icon: '✅',
        title: 'Zero Misses',
        desc: 'Never missed an appointment (3+ total)',
        tier: 'gold',
        check: (stats) => stats.missedAppointments === 0 && stats.totalAppointments >= 3
    },
    {
        id: 'prescription_keeper',
        icon: '📋',
        title: 'Record Keeper',
        desc: 'Saved your first prescription',
        tier: 'bronze',
        check: (stats) => stats.prescriptionCount >= 1
    },
    {
        id: 'five_prescriptions',
        icon: '📁',
        title: 'Health Organiser',
        desc: 'Saved 5 or more prescriptions',
        tier: 'silver',
        check: (stats) => stats.prescriptionCount >= 5
    },
    {
        id: 'champion',
        icon: '🏆',
        title: 'Health Champion',
        desc: 'Overall credibility score above 85%',
        tier: 'gold',
        check: (stats) => stats.credibilityPct >= 85
    }
];

// ── Raw stats from DB ─────────────────────────────────────────────────────────
const getRawStats = async (patientId) => {
    // 1. Medication adherence (last 90 days)
    const [medRows] = await sequelize.query(`
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status IN ('on_time','early') THEN 1 ELSE 0 END) AS good,
            SUM(CASE WHEN status = 'on_time'             THEN 1 ELSE 0 END) AS on_time,
            SUM(CASE WHEN status = 'missed'              THEN 1 ELSE 0 END) AS missed
        FROM medication_logs
        WHERE patient_id = :pid
          AND taken_time >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `, { replacements: { pid: patientId } });

    // 2. Last-7-day adherence
    const [last7] = await sequelize.query(`
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status IN ('on_time','early') THEN 1 ELSE 0 END) AS good
        FROM medication_logs
        WHERE patient_id = :pid
          AND taken_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `, { replacements: { pid: patientId } });

    // 3. Streak (consecutive on-time days)
    const [streakRows] = await sequelize.query(`
        SELECT DATE(taken_time) AS day,
               SUM(CASE WHEN status IN ('on_time','early') THEN 1 ELSE 0 END) AS good_doses,
               COUNT(*) AS total_doses
        FROM medication_logs
        WHERE patient_id = :pid
        GROUP BY DATE(taken_time)
        ORDER BY day DESC
        LIMIT 60
    `, { replacements: { pid: patientId } });

    let streak = 0;
    for (const row of streakRows) {
        if (parseInt(row.good_doses) > 0) streak++;
        else break;
    }

    // 4. Appointments
    const [aptRows] = await sequelize.query(`
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN status = 'missed'    THEN 1 ELSE 0 END) AS missed,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
        FROM appointments
        WHERE patient_id = :pid
    `, { replacements: { pid: patientId } });

    // 5. Prescriptions (JSON file)
    let prescriptionCount = 0;
    try {
        const all = JSON.parse(fs.readFileSync(PRESCRIPTIONS_FILE, 'utf8') || '[]');
        prescriptionCount = all.filter(p => String(p.patient_id) === String(patientId)).length;
    } catch { prescriptionCount = 0; }

    // 6. Feedback engagement
    const feedbacksSubmitted = getPatientFeedbackCount(patientId);

    const med     = medRows[0]  || { total: 0, good: 0, on_time: 0, missed: 0 };
    const l7      = last7[0]    || { total: 0, good: 0 };
    const apt     = aptRows[0]  || { total: 0, completed: 0, missed: 0, cancelled: 0 };

    const totalMedLogs    = parseInt(med.total)       || 0;
    const goodMeds        = parseInt(med.good)        || 0;
    const adherencePct    = totalMedLogs > 0 ? Math.round((goodMeds / totalMedLogs) * 100) : 0;
    const last7total      = parseInt(l7.total)        || 0;
    const last7good       = parseInt(l7.good)         || 0;
    const last7DayAdherence = last7total > 0 ? Math.round((last7good / last7total) * 100) : 0;

    const totalAppointments    = parseInt(apt.total)     || 0;
    const completedAppointments = parseInt(apt.completed) || 0;
    const missedAppointments   = parseInt(apt.missed)    || 0;
    const appointmentPct = totalAppointments > 0
        ? Math.round((completedAppointments / (totalAppointments - parseInt(apt.cancelled || 0) || 1)) * 100)
        : 0;

    return {
        totalMedLogs,
        goodMeds,
        adherencePct,
        last7DayAdherence,
        streak,
        totalAppointments,
        completedAppointments,
        missedAppointments,
        appointmentPct,
        prescriptionCount,
        feedbacksSubmitted
    };
};

// ── Main scorer ───────────────────────────────────────────────────────────────
const calculatePatientScore = async (patientId) => {
    const stats = await getRawStats(patientId);

    // ── Credibility algorithm ─────────────────────────────────
    // Medicine adherence:  35%  (0–100 → 0–35)
    const medScore  = (stats.adherencePct / 100) * 35;

    // Appointment rate:    25%  (0–100 → 0–25)
    const aptScore  = (Math.min(stats.appointmentPct, 100) / 100) * 25;

    // Streak:              20%  (0–30 days cap → 0–20)
    const streakScore = (Math.min(stats.streak, 30) / 30) * 20;

    // Prescriptions:       10%  (0–5 cap → 0–10)
    const rxScore = (Math.min(stats.prescriptionCount, 5) / 5) * 10;

    // Feedback engagement: 10%  (0–5 feedbacks cap → 0–10)
    const engagementScore = (Math.min(stats.feedbacksSubmitted, 5) / 5) * 10;

    const rawScore      = medScore + aptScore + streakScore + rxScore + engagementScore;
    const credibilityPct = Math.round(rawScore);

    // Attach credibility to stats for achievement checks
    const fullStats = { ...stats, credibilityPct };

    // Achievements
    const earned = ACHIEVEMENTS.filter(a => a.check(fullStats)).map(a => ({
        id: a.id, icon: a.icon, title: a.title, desc: a.desc, tier: a.tier
    }));

    const label =
        credibilityPct >= 85 ? 'Excellent' :
        credibilityPct >= 70 ? 'Good'      :
        credibilityPct >= 50 ? 'Average'   :
        credibilityPct >= 30 ? 'Needs Work': 'Getting Started';

    return {
        credibilityPct,
        label,
        breakdown: {
            medicineAdherence: Math.round(medScore),    // out of 35
            appointmentRate:   Math.round(aptScore),    // out of 25
            streak:            Math.round(streakScore), // out of 20
            prescriptions:     Math.round(rxScore),     // out of 10
            engagement:        Math.round(engagementScore) // out of 10
        },
        stats: {
            adherencePct:           stats.adherencePct,
            last7DayAdherence:      stats.last7DayAdherence,
            streak:                 stats.streak,
            totalMedLogs:           stats.totalMedLogs,
            completedAppointments:  stats.completedAppointments,
            totalAppointments:      stats.totalAppointments,
            missedAppointments:     stats.missedAppointments,
            prescriptionCount:      stats.prescriptionCount,
            feedbacksSubmitted:     stats.feedbacksSubmitted
        },
        achievements: earned
    };
};

module.exports = { calculatePatientScore, ACHIEVEMENTS };
