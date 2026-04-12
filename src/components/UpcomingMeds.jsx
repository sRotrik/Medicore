/**
 * Upcoming Medications Component - REFACTORED
 * Now uses global state from HealthContext
 * All data updates sync instantly across the app
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Clock, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { useHealth } from '../context/HealthContext';

const UpcomingMeds = () => {
    // ============================================
    // GLOBAL STATE - Single source of truth
    // ============================================
    const { medications, takeMedication, takenToday } = useHealth();

    // Handle marking medication as taken
    const handleMarkAsTaken = (medId) => {
        // Get current time in HH:MM format
        const now = new Date();
        const takenTime = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });

        // Dispatch action to global state
        // This will update:
        // 1. Medication list (remaining quantity)
        // 2. Dashboard (this component)
        // 3. Stats page (taken logs)
        takeMedication(medId, takenTime);
    };

    const getColorClasses = (color, isDisabled) => {
        if (isDisabled) {
            return {
                bg: 'bg-slate-800/50',
                border: 'border-slate-700',
                icon: 'text-slate-600',
                button: 'bg-slate-700 text-slate-500 cursor-not-allowed'
            };
        }

        const colors = {
            emerald: {
                bg: 'bg-emerald-500/5',
                border: 'border-emerald-500/20',
                icon: 'text-emerald-400',
                button: 'bg-emerald-500 hover:bg-emerald-600 text-white'
            },
            blue: {
                bg: 'bg-blue-500/5',
                border: 'border-blue-500/20',
                icon: 'text-blue-400',
                button: 'bg-blue-500 hover:bg-blue-600 text-white'
            },
            purple: {
                bg: 'bg-purple-500/5',
                border: 'border-purple-500/20',
                icon: 'text-purple-400',
                button: 'bg-purple-500 hover:bg-purple-600 text-white'
            },
            orange: {
                bg: 'bg-orange-500/5',
                border: 'border-orange-500/20',
                icon: 'text-orange-400',
                button: 'bg-orange-500 hover:bg-orange-600 text-white'
            },
            teal: {
                bg: 'bg-teal-500/5',
                border: 'border-teal-500/20',
                icon: 'text-teal-400',
                button: 'bg-teal-500 hover:bg-teal-600 text-white'
            }
        };

        return colors[color] || colors.emerald;
    };

    // Get today's day in short format (Mon, Tue, etc.)
    const getTodayShort = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[new Date().getDay()];
    };

    // Filter medications for today
    const todaysMedications = medications.filter(med => {
        // If medication has selectedDays array, check if today is included
        if (med.selectedDays && Array.isArray(med.selectedDays)) {
            return med.selectedDays.includes(getTodayShort());
        }
        // If no selectedDays, show all medications (backward compatibility)
        return true;
    });

    // Assign colors to today's medications
    const medicationsWithColors = todaysMedications.map((med, index) => ({
        ...med,
        color: ['emerald', 'blue', 'purple', 'orange', 'teal'][index % 5]
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Pill className="text-emerald-400" size={24} />
                    Upcoming Medications
                </h2>
                <span className="text-sm text-slate-400">Today's Schedule</span>
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {medicationsWithColors.map((med, index) => {
                        const isTakenToday = takenToday?.has(med.id);
                        const isDisabled = med.remainingQty === 0 || isTakenToday;
                        const colorClasses = getColorClasses(med.color, isDisabled);

                        return (
                            <motion.div
                                key={med.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={!isDisabled ? { y: -2, boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.2)" } : {}}
                                className={`${colorClasses.bg} border ${colorClasses.border} rounded-xl p-4 transition-all duration-300 relative overflow-hidden`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`p-3 ${colorClasses.bg} rounded-lg border ${colorClasses.border}`}>
                                        <Pill className={colorClasses.icon} size={24} />
                                    </div>

                                    {/* Medicine Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-white text-lg">{med.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="text-slate-500" size={14} />
                                                    <span className="text-sm text-slate-400">{med.scheduledTime}</span>
                                                    <span className="text-xs text-slate-500">• {med.mealType} meal</span>
                                                </div>
                                            </div>
                                            {isDisabled && (
                                                <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-medium">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>

                                        {/* Dosage Info */}
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div className="bg-slate-800/50 rounded-lg p-2">
                                                <p className="text-xs text-slate-500 mb-1">Dosage</p>
                                                <p className="text-sm font-semibold text-white">
                                                    {med.qtyPerDose} {med.qtyPerDose > 1 ? 'tablets' : 'tablet'}
                                                </p>
                                            </div>
                                            <div className="bg-slate-800/50 rounded-lg p-2">
                                                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                                    <Package size={12} />
                                                    Remaining
                                                </p>
                                                <p className={`text-sm font-semibold ${med.remainingQty < 10 ? 'text-orange-400' : 'text-white'
                                                    }`}>
                                                    {med.remainingQty} {med.remainingQty !== 1 ? 'tablets' : 'tablet'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Low Stock Warning */}
                                        {med.remainingQty > 0 && med.remainingQty < 10 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-2 mb-3 text-orange-400 text-xs bg-orange-500/10 border border-orange-500/20 rounded-lg p-2"
                                            >
                                                <AlertCircle size={14} />
                                                <span>Low stock - Consider refilling soon</span>
                                            </motion.div>
                                        )}

                                        {/* Action Button */}
                                        <motion.button
                                            onClick={() => !isDisabled && handleMarkAsTaken(med.id)}
                                            disabled={isDisabled}
                                            whileHover={!isDisabled ? { scale: 1.02 } : {}}
                                            whileTap={!isDisabled ? { scale: 0.98 } : {}}
                                            className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${colorClasses.button}`}
                                        >
                                            {isDisabled ? (
                                                <>
                                                    {takenToday?.has(med.id) ? (
                                                        <><CheckCircle2 size={16} />Taken Today</>
                                                    ) : (
                                                        <><AlertCircle size={16} />Refill Required</>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={16} />
                                                    Mark as Taken
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Summary Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 pt-4 border-t border-slate-800"
            >
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                        Medications for {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]}
                    </span>
                    <span className="text-white font-semibold">{todaysMedications.length} dose{todaysMedications.length !== 1 ? 's' : ''}</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UpcomingMeds;
