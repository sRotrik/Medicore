import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, CheckCircle, AlertCircle, Briefcase, Smile, Clock, MessageCircle, ThumbsUp } from 'lucide-react';

const CRITERIA = [
    { key: 'work_quality',   label: 'Work Quality',   icon: Briefcase,     desc: 'How well does your helper perform their duties?' },
    { key: 'behavior',       label: 'Behavior',        icon: Smile,         desc: 'Attitude, friendliness and professionalism' },
    { key: 'punctuality',    label: 'Punctuality',     icon: Clock,         desc: 'On-time responses and reliable scheduling' },
    { key: 'communication',  label: 'Communication',   icon: MessageCircle, desc: 'Clarity and responsiveness in communication' },
    { key: 'overall',        label: 'Overall',         icon: ThumbsUp,      desc: 'Your overall satisfaction with your helper' },
];

const StarRating = ({ value, onChange, disabled }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110 disabled:cursor-default"
                >
                    <Star
                        className={`w-8 h-8 transition-colors ${
                            star <= (hovered || value)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
};

const LABEL_MAP = { 1: 'Poor', 2: 'Needs Work', 3: 'Average', 4: 'Good', 5: 'Excellent' };

const FeedbackPage = () => {
    const { token } = useParams();
    const navigate  = useNavigate();

    const [state, setState]   = useState('loading'); // loading | valid | invalid | submitted
    const [info, setInfo]     = useState(null);
    const [scores, setScores] = useState({ work_quality: 0, behavior: 0, punctuality: 0, communication: 0, overall: 0 });
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]   = useState('');

    useEffect(() => {
        fetch(`http://localhost:5000/api/feedback/${token}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setInfo({ helperName: data.helperName, patientName: data.patientName });
                    setState('valid');
                } else {
                    setError(data.message);
                    setState('invalid');
                }
            })
            .catch(() => { setError('Could not load feedback form'); setState('invalid'); });
    }, [token]);

    const allRated = Object.values(scores).every(v => v > 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!allRated) { setError('Please rate all categories'); return; }
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch(`http://localhost:5000/api/feedback/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scores, comment })
            });
            const data = await res.json();
            if (data.success) setState('submitted');
            else setError(data.message || 'Submission failed');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (state === 'loading') return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (state === 'invalid') return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-10">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Link Invalid</h2>
                <p className="text-slate-400">{error || 'This feedback link is invalid or has expired.'}</p>
            </motion.div>
        </div>
    );

    if (state === 'submitted') return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-center max-w-md bg-slate-900 rounded-2xl border border-emerald-500/20 p-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                    <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-3">Thank You! 🎉</h2>
                <p className="text-slate-300 text-lg mb-2">Your feedback has been submitted.</p>
                <p className="text-slate-500 text-sm">Your response helps us improve the quality of care for all patients.</p>
                <motion.div className="mt-8 p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/20">
                    <p className="text-emerald-300 text-sm font-medium">⭐ Your voice matters — it directly affects the credibility scoring of your helper!</p>
                </motion.div>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
            {/* Background gradient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-xl mx-auto relative z-10">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm font-medium mb-4">
                        ⭐ Weekly Feedback
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Rate Your Helper</h1>
                    <p className="text-slate-400">
                        How has <span className="text-indigo-300 font-semibold">{info?.helperName}</span> been doing this week?
                    </p>
                </motion.div>

                {/* Form Card */}
                <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">

                    {/* Rating criteria */}
                    <div className="p-6 space-y-6">
                        {CRITERIA.map(({ key, label, icon: Icon, desc }, i) => (
                            <motion.div key={key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 mt-0.5">
                                        <Icon className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-white">{label}</h3>
                                            {scores[key] > 0 && (
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    scores[key] >= 4 ? 'bg-emerald-500/20 text-emerald-300' :
                                                    scores[key] >= 3 ? 'bg-amber-500/20 text-amber-300' :
                                                    'bg-red-500/20 text-red-300'
                                                }`}>
                                                    {LABEL_MAP[scores[key]]}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                                    </div>
                                </div>
                                <StarRating
                                    value={scores[key]}
                                    onChange={(v) => setScores(prev => ({ ...prev, [key]: v }))}
                                />
                            </motion.div>
                        ))}

                        {/* Comment */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Additional Comments <span className="text-slate-600">(optional)</span>
                            </label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                rows={3}
                                placeholder="Share anything else about your experience this week..."
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none transition-all"
                            />
                        </motion.div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="p-6 pt-0">
                        <motion.button
                            type="submit"
                            disabled={!allRated || submitting}
                            whileHover={allRated ? { scale: 1.01 } : {}}
                            whileTap={allRated ? { scale: 0.99 } : {}}
                            className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                                allRated && !submitting
                                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-lg shadow-indigo-900/30'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Submit Feedback
                                </>
                            )}
                        </motion.button>
                        {!allRated && (
                            <p className="text-center text-slate-600 text-xs mt-2">Please rate all 5 categories to submit</p>
                        )}
                    </div>
                </motion.form>

                <p className="text-center text-slate-700 text-xs mt-6">
                    MedSmart © 2026 · Your feedback is confidential
                </p>
            </div>
        </div>
    );
};

export default FeedbackPage;
