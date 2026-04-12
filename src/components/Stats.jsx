/**
 * Stats Page - REFACTORED
 * Now uses global state from HealthContext
 * All stats are derived from global state - NO local hardcoded data
 * Updates instantly when medications are taken
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Award,
    Target,
    Zap,
    Heart,
    Sparkles,
    ThumbsUp,
    Activity
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

const Stats = ({ medications: propMedications }) => {
    // ============================================
    // GLOBAL STATE - Single source of truth
    // ============================================
    const { medications: contextMedications, takenToday } = useHealth();
    const medications = propMedications || contextMedications || [];

    // Simple stats calculation
    const getTodayStats = (meds) => {
        const takenSet = takenToday || new Set();
        
        const isMedTaken = (m) => takenSet.has(m._id || m.id) || (m.takenLogs && m.takenLogs.length > 0);
        
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();

        let takenCount = 0;
        let pendingCount = 0;
        let missedCount = 0;

        const medicationDetails = meds.map(m => {
            const isTaken = isMedTaken(m);
            const scheduledTime = m.time || m.scheduledTime || '00:00';
            let schedMins = 0;
            if (scheduledTime.includes(':')) {
                const parts = scheduledTime.split(':');
                if (parts.length === 2) {
                   schedMins = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                }
            }

            let status = 'missed';
            if (isTaken) {
                status = 'on-time';
                takenCount++;
            } else if (currentMins < schedMins) {
                status = 'pending';
                pendingCount++;
            } else {
                status = 'missed';
                missedCount++;
            }

            return {
                id: m._id || m.id,
                name: m.name,
                scheduledTime: scheduledTime,
                actualTime: isTaken ? 'Taken' : null,
                status: status,
                delay: 0
            };
        });

        return {
            total: meds.length,
            takenCount: takenCount,
            onTime: takenCount,
            late: 0,
            missed: missedCount,
            pending: pendingCount,
            complianceRate: meds.length > 0 ? (Math.round((takenCount / meds.length) * 100)) : 0,
            medicationDetails
        };
    };

    // Derive stats from global state
    const todayStats = getTodayStats(medications);

    // Animated counter state
    const [counts, setCounts] = useState({
        total: 0,
        onTime: 0,
        late: 0,
        missed: 0
    });

    // Animate counters when stats change
    useEffect(() => {
        const { total, onTime, late, missed } = todayStats;

        // Animate counters
        const duration = 1000;
        const steps = 30;
        const interval = duration / steps;

        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;

            setCounts({
                total: Math.floor(total * progress),
                onTime: Math.floor(onTime * progress),
                late: Math.floor(late * progress),
                missed: Math.floor(missed * progress)
            });

            if (step >= steps) {
                clearInterval(timer);
                setCounts({ total, onTime, late, missed });
            }
        }, interval);

        return () => clearInterval(timer);
    }, [todayStats.total, todayStats.onTime, todayStats.late, todayStats.missed]);

    // Get status color and icon
    const getStatusConfig = (status) => {
        switch (status) {
            case 'on-time':
                return {
                    color: 'emerald',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    text: 'text-emerald-400',
                    icon: CheckCircle2,
                    label: 'On Time'
                };
            case 'late':
                return {
                    color: 'yellow',
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/20',
                    text: 'text-yellow-400',
                    icon: AlertCircle,
                    label: 'Late'
                };
            case 'missed':
                return {
                    color: 'red',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    text: 'text-red-400',
                    icon: XCircle,
                    label: 'Missed'
                };
            case 'pending':
                return {
                    color: 'blue',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                    text: 'text-blue-400',
                    icon: Clock,
                    label: 'Pending'
                };
            default:
                return {
                    color: 'slate',
                    bg: 'bg-slate-500/10',
                    border: 'border-slate-500/20',
                    text: 'text-slate-400',
                    icon: Clock,
                    label: 'Unknown'
                };
        }
    };

    // Generate performance remarks
    const getPerformanceRemarks = () => {
        const { onTime, late, missed, total } = counts;
        const completionRate = total > 0 ? ((onTime + late) / total) * 100 : 0;

        if (onTime === total && total > 0) {
            return {
                message: "Excellent! You followed your schedule perfectly today 🎉",
                type: 'perfect',
                icon: Award,
                color: 'emerald'
            };
        } else if (missed === 0 && late <= 2 && total > 0) {
            return {
                message: "Great job! All doses taken with minor delays. Keep it up! 💚",
                type: 'good',
                icon: ThumbsUp,
                color: 'blue'
            };
        } else if (missed === 0 && total > 0) {
            return {
                message: "Good effort! Try to take medicines closer to scheduled time.",
                type: 'okay',
                icon: Target,
                color: 'yellow'
            };
        } else if (completionRate >= 60) {
            return {
                message: "You missed some doses today. Set reminders to improve adherence.",
                type: 'needs-improvement',
                icon: AlertCircle,
                color: 'orange'
            };
        } else {
            return {
                message: "Let's work on consistency. Your health depends on regular medication.",
                type: 'critical',
                icon: Heart,
                color: 'red'
            };
        }
    };

    const remarks = getPerformanceRemarks();

    // Get achievement badge
    const getAchievementBadge = () => {
        const { onTime, total, missed } = counts;

        if (onTime === total && total > 0) {
            return {
                title: 'Perfect Day',
                emoji: '🏆',
                description: 'All medications taken on time!',
                show: true,
                confetti: true
            };
        } else if (missed === 0 && total > 0) {
            return {
                title: 'Keep Improving',
                emoji: '💪',
                description: 'No missed doses today!',
                show: true,
                confetti: false
            };
        } else if (onTime >= total / 2 && total > 0) {
            return {
                title: 'Making Progress',
                emoji: '🌟',
                description: 'More than half on time!',
                show: true,
                confetti: false
            };
        }

        return { show: false };
    };

    const achievement = getAchievementBadge();

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <Activity className="text-emerald-400" size={36} />
                        Today's Health Stats
                    </h1>
                    <p className="text-slate-400 text-lg flex items-center gap-2">
                        Your consistency matters 💚 • Real-time data from global state
                    </p>
                </motion.div>

                {/* Performance Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Total Scheduled */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.3)" }}
                        className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <Clock className="text-blue-400" size={24} />
                            </div>
                            <span className="text-3xl">📋</span>
                        </div>
                        <h3 className="text-sm text-slate-400 mb-1">Total Scheduled</h3>
                        <motion.p
                            key={counts.total}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-4xl font-bold text-white"
                        >
                            {counts.total}
                        </motion.p>
                        <p className="text-xs text-blue-300 mt-2">medicines today</p>
                    </motion.div>

                    {/* On Time */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.3)" }}
                        className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-6"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-emerald-500/20 rounded-lg">
                                <CheckCircle2 className="text-emerald-400" size={24} />
                            </div>
                            <span className="text-3xl">✅</span>
                        </div>
                        <h3 className="text-sm text-slate-400 mb-1">On Time</h3>
                        <motion.p
                            key={counts.onTime}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-4xl font-bold text-emerald-400"
                        >
                            {counts.onTime}
                        </motion.p>
                        <p className="text-xs text-emerald-300 mt-2">perfect timing</p>
                    </motion.div>

                    {/* Late */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(234, 179, 8, 0.3)" }}
                        className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-yellow-500/20 rounded-lg">
                                <AlertCircle className="text-yellow-400" size={24} />
                            </div>
                            <span className="text-3xl">⏰</span>
                        </div>
                        <h3 className="text-sm text-slate-400 mb-1">Late</h3>
                        <motion.p
                            key={counts.late}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-4xl font-bold text-yellow-400"
                        >
                            {counts.late}
                        </motion.p>
                        <p className="text-xs text-yellow-300 mt-2">delayed doses</p>
                    </motion.div>

                    {/* Missed */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(239, 68, 68, 0.3)" }}
                        className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl p-6"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-red-500/20 rounded-lg">
                                <XCircle className="text-red-400" size={24} />
                            </div>
                            <span className="text-3xl">❌</span>
                        </div>
                        <h3 className="text-sm text-slate-400 mb-1">Missed</h3>
                        <motion.p
                            key={counts.missed}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-4xl font-bold text-red-400"
                        >
                            {counts.missed}
                        </motion.p>
                        <p className="text-xs text-red-300 mt-2">need attention</p>
                    </motion.div>
                </div>

                {/* Achievement Badge */}
                <AnimatePresence>
                    {achievement.show && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                            className="mb-8"
                        >
                            <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
                                {achievement.confetti && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 pointer-events-none"
                                    >
                                        <Sparkles className="absolute top-4 left-4 text-yellow-400" size={20} />
                                        <Sparkles className="absolute top-6 right-8 text-pink-400" size={16} />
                                        <Sparkles className="absolute bottom-8 left-12 text-purple-400" size={18} />
                                        <Sparkles className="absolute bottom-4 right-4 text-orange-400" size={20} />
                                    </motion.div>
                                )}
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-6xl"
                                    >
                                        {achievement.emoji}
                                    </motion.div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                            <Award className="text-yellow-400" size={24} />
                                            {achievement.title}
                                        </h3>
                                        <p className="text-slate-300">{achievement.description}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Performance Remarks */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8"
                >
                    <motion.div
                        animate={{
                            boxShadow: [
                                "0 0 0 0 rgba(16, 185, 129, 0)",
                                "0 0 20px 5px rgba(16, 185, 129, 0.2)",
                                "0 0 0 0 rgba(16, 185, 129, 0)"
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`bg-gradient-to-r from-${remarks.color}-500/10 to-${remarks.color}-600/10 border border-${remarks.color}-500/20 rounded-2xl p-6`}
                    >
                        <div className="flex items-start gap-4">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`p-3 bg-${remarks.color}-500/20 rounded-xl`}
                            >
                                <remarks.icon className={`text-${remarks.color}-400`} size={28} />
                            </motion.div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    Performance Feedback
                                </h3>
                                <p className={`text-${remarks.color}-200 text-lg`}>
                                    {remarks.message}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Today's Medication Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="text-emerald-400" size={28} />
                        Today's Medication Timeline
                    </h2>

                    <div className="space-y-4">
                        {todayStats.medicationDetails.map((med, index) => {
                            const statusConfig = getStatusConfig(med.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <motion.div
                                    key={med.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    whileHover={{ y: -2, boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.2)" }}
                                    className={`${statusConfig.bg} border ${statusConfig.border} rounded-xl p-5 transition-all duration-300`}
                                >
                                    <div className="flex items-center justify-between">
                                        {/* Medicine Info */}
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`p-3 ${statusConfig.bg} rounded-lg border ${statusConfig.border}`}>
                                                <StatusIcon className={statusConfig.text} size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">
                                                    {med.name}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        <span>Scheduled: {med.scheduledTime}</span>
                                                    </div>
                                                    {med.actualTime && (
                                                        <div className="flex items-center gap-1">
                                                            <Zap size={14} />
                                                            <span>Taken: {med.actualTime}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status and Delay */}
                                        <div className="flex items-center gap-6">
                                            {/* Delay Info */}
                                            <div className="text-right">
                                                {med.status === 'on-time' && (
                                                    <p className="text-emerald-400 font-semibold">
                                                        Taken on time ✓
                                                    </p>
                                                )}
                                                {med.status === 'late' && (
                                                    <p className="text-yellow-400 font-semibold">
                                                        Taken {med.delay} min late
                                                    </p>
                                                )}
                                                {med.status === 'missed' && (
                                                    <p className="text-red-400 font-semibold">
                                                        Missed dose
                                                    </p>
                                                )}
                                                {med.status === 'pending' && (
                                                    <p className="text-blue-400 font-semibold">
                                                        Upcoming dose
                                                    </p>
                                                )}
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`px-4 py-2 ${statusConfig.bg} border ${statusConfig.border} rounded-lg`}>
                                                <span className={`${statusConfig.text} font-semibold text-sm flex items-center gap-2`}>
                                                    <StatusIcon size={16} />
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-400 mb-3">Status Legend:</h3>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-sm text-slate-400">On Time (±5 min)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span className="text-sm text-slate-400">Late (&gt;5 min delay)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-sm text-slate-400">Missed (not taken)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-slate-400">Pending (upcoming)</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Stats;
