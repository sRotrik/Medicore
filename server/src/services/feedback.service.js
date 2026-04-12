/**
 * Helper Feedback Service
 * Stores + calculates credibility scores from patient feedback
 * Uses JSON file storage (no CREATE TABLE needed)
 */

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const FEEDBACK_FILE = path.join(__dirname, '../../feedback.json');

// ── Helpers ───────────────────────────────────────────────────────────────────
const readFeedback = () => {
    if (!fs.existsSync(FEEDBACK_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8')); }
    catch { return []; }
};

const writeFeedback = (data) => {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
};

// ── Generate secure one-time link token ───────────────────────────────────────
const generateFeedbackToken = (patientId, helperId) => {
    const payload = `${patientId}-${helperId}-${Date.now()}`;
    return crypto.createHash('sha256').update(payload).digest('hex').substring(0, 32);
};

// ── Save a pending feedback request ───────────────────────────────────────────
const createFeedbackRequest = (patientId, helperId, patientEmail, patientName, helperName) => {
    const all = readFeedback();
    const token = generateFeedbackToken(patientId, helperId);
    const existing = all.find(f => f.token === token);
    if (existing) return existing.token;

    all.push({
        token,
        patient_id:   patientId,
        helper_id:    helperId,
        patient_email: patientEmail,
        patient_name:  patientName,
        helper_name:   helperName,
        submitted:     false,
        created_at:    new Date().toISOString(),
        expires_at:    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });

    writeFeedback(all);
    return token;
};

// ── Submit feedback ────────────────────────────────────────────────────────────
const submitFeedback = (token, scores, comment) => {
    const all = readFeedback();
    const idx = all.findIndex(f => f.token === token && !f.submitted);
    if (idx === -1) return { success: false, message: 'Invalid or expired feedback link' };

    all[idx].submitted    = true;
    all[idx].submitted_at = new Date().toISOString();
    all[idx].scores       = scores;  // { work_quality, behavior, punctuality, communication, overall }
    all[idx].comment      = comment || '';

    writeFeedback(all);
    return { success: true, helperId: all[idx].helper_id, helperName: all[idx].helper_name };
};

// ── Validate token (check if it's valid + not submitted) ─────────────────────
const validateToken = (token) => {
    const all = readFeedback();
    const entry = all.find(f => f.token === token);
    if (!entry) return { valid: false, message: 'Feedback link not found' };
    if (entry.submitted) return { valid: false, message: 'Feedback already submitted' };
    if (new Date() > new Date(entry.expires_at)) return { valid: false, message: 'Feedback link has expired' };
    return { valid: true, entry };
};

// ── Credibility Score Algorithm ───────────────────────────────────────────────
/**
 * Weights:
 *  work_quality    30%
 *  behavior        25%
 *  punctuality     20%
 *  communication   15%
 *  overall         10%
 * 
 * Time-decay:
 *  Submissions within 7 days  → weight * 1.0
 *  8–14 days                  → weight * 0.8
 *  15–30 days                 → weight * 0.5
 *  31+ days                   → weight * 0.3
 */
const WEIGHTS = {
    work_quality:  0.30,
    behavior:      0.25,
    punctuality:   0.20,
    communication: 0.15,
    overall:       0.10
};

const getTimeDecay = (submittedAt) => {
    const diffDays = (Date.now() - new Date(submittedAt)) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7)  return 1.0;
    if (diffDays <= 14) return 0.8;
    if (diffDays <= 30) return 0.5;
    return 0.3;
};

const calculateCredibilityScore = (helperId) => {
    const all = readFeedback();
    const submissions = all.filter(f => f.helper_id === helperId && f.submitted && f.scores);

    if (submissions.length === 0) return {
        score: null,
        label: 'No reviews yet',
        totalReviews: 0,
        breakdown: null
    };

    let totalWeight = 0;
    let weightedSum = 0;
    const categoryTotals = { work_quality: 0, behavior: 0, punctuality: 0, communication: 0, overall: 0 };
    const categoryCounts = { work_quality: 0, behavior: 0, punctuality: 0, communication: 0, overall: 0 };

    for (const sub of submissions) {
        const decay = getTimeDecay(sub.submitted_at);
        const s = sub.scores;

        // Weighted composite for this submission
        const compositeScore =
            (s.work_quality   * WEIGHTS.work_quality) +
            (s.behavior       * WEIGHTS.behavior) +
            (s.punctuality    * WEIGHTS.punctuality) +
            (s.communication  * WEIGHTS.communication) +
            (s.overall        * WEIGHTS.overall);

        weightedSum  += compositeScore * decay;
        totalWeight  += decay;

        // Category averages
        Object.keys(categoryTotals).forEach(key => {
            if (s[key] !== undefined) {
                categoryTotals[key] += s[key];
                categoryCounts[key]++;
            }
        });
    }

    const rawScore = totalWeight > 0 ? (weightedSum / totalWeight) : 0;
    const score    = Math.round(rawScore * 10) / 10; // 1 decimal

    // Convert to percentage (score is 1–5 scale)
    const percentage = Math.round(((score - 1) / 4) * 100);

    const label =
        percentage >= 85 ? 'Excellent'  :
        percentage >= 70 ? 'Good'       :
        percentage >= 50 ? 'Average'    :
        percentage >= 30 ? 'Needs Work' : 'Poor';

    const breakdown = {};
    Object.keys(categoryTotals).forEach(key => {
        breakdown[key] = categoryCounts[key] > 0
            ? Math.round((categoryTotals[key] / categoryCounts[key]) * 10) / 10
            : null;
    });

    return {
        score,         // 1.0 – 5.0
        percentage,    // 0 – 100
        label,
        totalReviews: submissions.length,
        breakdown,
        recentComments: submissions.slice(-3).map(s => s.comment).filter(Boolean)
    };
};

// ── Get all scores for admin ───────────────────────────────────────────────────
const getAllHelperScores = () => {
    const all = readFeedback();
    const helperIds = [...new Set(all.filter(f => f.helper_id).map(f => f.helper_id))];
    const result = {};
    helperIds.forEach(id => { result[id] = calculateCredibilityScore(id); });
    return result;
};

// ── Patient engagement: count how many feedbacks this patient has submitted ───
const getPatientFeedbackCount = (patientId) => {
    const all = readFeedback();
    return all.filter(f => f.patient_id === patientId && f.submitted).length;
};

module.exports = {
    createFeedbackRequest,
    submitFeedback,
    validateToken,
    calculateCredibilityScore,
    getAllHelperScores,
    getPatientFeedbackCount
};
