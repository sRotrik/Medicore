/**
 * PatientScoreCard — Reusable, role-aware widget
 * Props:
 *   patientId  — whose score to show (admin/helper use case)
 *   mode       — 'patient' | 'helper' | 'admin'
 *               'patient' & 'admin' → show full credibility score
 *               'helper'           → show achievements + stats only (no raw %)
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Star, TrendingUp, Calendar, Pill, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const TIER_STYLES = {
    gold:   'bg-amber-500/20   text-amber-300   border-amber-500/30',
    silver: 'bg-slate-400/20   text-slate-300   border-slate-400/30',
    bronze: 'bg-orange-700/20  text-orange-300  border-orange-700/30'
};

const TIER_DOT = {
    gold:   'bg-amber-400',
    silver: 'bg-slate-400',
    bronze: 'bg-orange-500'
};

const statLabel = (key) => ({
    adherencePct:          'Med. Adherence',
    last7DayAdherence:     'Last 7 Days',
    streak:                'Day Streak',
    totalMedLogs:          'Doses Logged',
    completedAppointments: 'Appts Attended',
    totalAppointments:     'Total Appts',
    missedAppointments:    'Appts Missed',
    prescriptionCount:     'Prescriptions',
    feedbacksSubmitted:    'Feedbacks Given'
}[key] || key);

const statIcon = (key) => ({
    adherencePct: Pill,
    last7DayAdherence: Flame,
    streak: Flame,
    completedAppointments: Calendar,
    totalAppointments: Calendar,
    prescriptionCount: FileText
}[key] || Star);

const PatientScoreCard = ({ patientId, mode = 'patient' }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const fetchScore = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                let url;
                if (mode === 'patient') url = 'http://localhost:5000/api/patient/score';
                else if (mode === 'admin')  url = `http://localhost:5000/api/admin/patients/${patientId}/score`;
                else                        url = `http://localhost:5000/api/helper/patients/${patientId}/achievements`;

                const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                const json = await res.json();
                if (json.success) setData(json);
            } catch (e) { console.error('PatientScoreCard error:', e); }
            finally { setLoading(false); }
        };
        fetchScore();
    }, [patientId, mode]);

    if (loading) return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 animate-pulse">
            <div className="h-4 w-32 bg-slate-800 rounded mb-3" />
            <div className="h-8 w-20 bg-slate-800 rounded" />
        </div>
    );

    if (!data) return null;

    const { credibilityPct, label, breakdown, stats, achievements = [] } = data;
    const showScore = mode !== 'helper';

    // colour based on score
    const scoreColor =
        credibilityPct >= 85 ? 'text-emerald-400' :
        credibilityPct >= 70 ? 'text-blue-400'    :
        credibilityPct >= 50 ? 'text-amber-400'   : 'text-red-400';

    const barColor =
        credibilityPct >= 85 ? 'bg-emerald-400' :
        credibilityPct >= 70 ? 'bg-blue-400'    :
        credibilityPct >= 50 ? 'bg-amber-400'   : 'bg-red-400';

    const badgeColor =
        credibilityPct >= 85 ? 'bg-emerald-500/20 text-emerald-300' :
        credibilityPct >= 70 ? 'bg-blue-500/20 text-blue-300'       :
        credibilityPct >= 50 ? 'bg-amber-500/20 text-amber-300'     : 'bg-red-500/20 text-red-300';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden"
        >
            {/* ── Header ────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <Trophy className="text-amber-400 w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">
                            {showScore ? 'Health Credibility' : 'Patient Achievements'}
                        </h3>
                        <p className="text-slate-500 text-xs">{achievements.length} badge{achievements.length !== 1 ? 's' : ''} earned</p>
                    </div>
                </div>

                {showScore && (
                    <div className="text-right">
                        <div className={`text-3xl font-black ${scoreColor}`}>
                            {credibilityPct}<span className="text-base text-slate-600 font-normal">%</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>{label}</span>
                    </div>
                )}
            </div>

            {/* ── Score bar ─────────────────────────────── */}
            {showScore && (
                <div className="px-6 pb-4">
                    <div className="w-full bg-slate-800 rounded-full h-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${credibilityPct}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-2 rounded-full ${barColor}`}
                        />
                    </div>
                </div>
            )}

            {/* ── Achievements grid ─────────────────────── */}
            {achievements.length > 0 && (
                <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                        {achievements.map(a => (
                            <motion.div
                                key={a.id}
                                whileHover={{ scale: 1.05 }}
                                title={a.desc}
                                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border ${TIER_STYLES[a.tier]}`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${TIER_DOT[a.tier]}`} />
                                <span>{a.icon}</span>
                                <span>{a.title}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {achievements.length === 0 && (
                <div className="px-6 pb-4 text-center text-slate-600 text-xs">
                    No achievements yet — keep taking medicines on time! 💊
                </div>
            )}

            {/* ── Stats (expandable) ───────────────────── */}
            <div className="border-t border-slate-800">
                <button
                    onClick={() => setExpanded(v => !v)}
                    className="w-full flex items-center justify-between px-6 py-3 text-slate-400 hover:text-slate-300 text-xs transition-colors"
                >
                    <span className="font-medium">View Stats Breakdown</span>
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <AnimatePresence>
                    {expanded && stats && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 pb-5 grid grid-cols-2 gap-2.5">
                                {Object.entries(stats).map(([key, val]) => {
                                    const Icon = statIcon(key);
                                    const isPercent = key.toLowerCase().includes('pct') || key.toLowerCase().includes('rate');
                                    return (
                                        <div key={key} className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-2.5">
                                            <Icon size={14} className="text-violet-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-slate-500 text-[10px]">{statLabel(key)}</p>
                                                <p className="text-white font-bold text-sm">
                                                    {val}{isPercent ? '%' : ''}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Score breakdown — admin & patient only */}
                            {showScore && breakdown && (
                                <div className="px-6 pb-5">
                                    <p className="text-slate-500 text-xs mb-2 font-medium">Score Breakdown (out of 100)</p>
                                    <div className="grid grid-cols-5 gap-2">
                                        {[
                                            { label: '💊 Medicine', val: breakdown.medicineAdherence, max: 35 },
                                            { label: '📅 Appts',   val: breakdown.appointmentRate,   max: 25 },
                                            { label: '🔥 Streak',  val: breakdown.streak,            max: 20 },
                                            { label: '📋 Rx',      val: breakdown.prescriptions,     max: 10 },
                                            { label: '💬 Engage',  val: breakdown.engagement,        max: 10 }
                                        ].map(item => (
                                            <div key={item.label} className="text-center bg-slate-800/50 rounded-xl p-2">
                                                <p className="text-slate-500 text-[9px] mb-1">{item.label}</p>
                                                <p className="text-white font-bold text-sm">{item.val ?? 0}</p>
                                                <p className="text-slate-600 text-[9px]">/{item.max}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default PatientScoreCard;
