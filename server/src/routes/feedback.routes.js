/**
 * Feedback Routes
 * Public: GET  /api/feedback/:token          (validate token)
 * Public: POST /api/feedback/:token          (submit ratings → updates patient score)
 * Auth'd: GET  /api/feedback/helper/:id/score (helper/admin credibility score)
 * Admin:  POST /api/feedback/send-now         (manually trigger feedback emails)
 */

const express = require('express');
const router  = express.Router();
const feedbackService = require('../services/feedback.service');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

// ── Admin: trigger feedback emails right now ──────────────────────────────────
// POST /api/feedback/send-now
router.post('/send-now', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { sendWeeklyFeedbackEmails } = require('../jobs/scheduler');
        await sendWeeklyFeedbackEmails();
        res.json({ success: true, message: 'Feedback emails triggered successfully' });
    } catch (err) {
        console.error('send-now error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/feedback/helper/:id/score  (must be before /:token wildcard) ─────
router.get('/helper/:id/score', verifyToken, (req, res) => {
    const helperId = parseInt(req.params.id, 10);
    const score = feedbackService.calculateCredibilityScore(helperId);
    res.json({ success: true, score });
});

// ── GET /api/feedback/:token  → validate & get helper name ───────────────────
router.get('/:token', (req, res) => {
    const { token } = req.params;
    const result = feedbackService.validateToken(token);
    if (!result.valid) return res.status(400).json({ success: false, message: result.message });

    res.json({
        success: true,
        helperName:  result.entry.helper_name,
        patientName: result.entry.patient_name
    });
});

// ── POST /api/feedback/:token  → submit feedback, auto-updates patient score ──
router.post('/:token', (req, res) => {
    const { token } = req.params;
    const { scores, comment } = req.body;

    if (!scores || typeof scores !== 'object') {
        return res.status(400).json({ success: false, message: 'Scores are required' });
    }

    const result = feedbackService.submitFeedback(token, scores, comment);
    if (!result.success) return res.status(400).json(result);

    // Patient score auto-recalculates on next fetch (no explicit action needed —
    // getPatientFeedbackCount reads from feedback.json live)
    res.json({
        success: true,
        message: 'Thank you for your feedback! Your engagement has been recorded. 🌟'
    });
});

module.exports = router;
