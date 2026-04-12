/**
 * Read-Only Medication View for Helpers
 * Shows patient's medications without "Take Pill" button
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Pill, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { useNavigate } from 'react-router-dom';

const HelperMedicationView = ({ medications: propMedications, patientId }) => {
    const navigate = useNavigate();
    const { medications: contextMedications } = useHealth();
    const medications = propMedications || contextMedications || [];

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const getMedicationStatus = (med) => {
        const [hours, minutes] = med.scheduledTime.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        const todayLog = med.takenLogs?.find(log => {
            const logDate = new Date(log.takenTime);
            return logDate.toDateString() === now.toDateString();
        });

        if (todayLog) {
            return { status: 'taken', log: todayLog };
        }

        if (currentHour > hours || (currentHour === hours && currentMinute > minutes)) {
            return { status: 'missed', log: null };
        }

        return { status: 'upcoming', log: null };
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'taken':
                return (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400">Taken</span>
                    </div>
                );
            case 'missed':
                return (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-medium text-red-400">Missed</span>
                    </div>
                );
            case 'upcoming':
                return (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400">Upcoming</span>
                    </div>
                );
            default:
                return null;
        }
    };

    const sortedMedications = [...medications].sort((a, b) => {
        const [aHours, aMinutes] = a.scheduledTime.split(':').map(Number);
        const [bHours, bMinutes] = b.scheduledTime.split(':').map(Number);
        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
    });

    return (
        <div className="space-y-4">
            {patientId && (
                <div className="flex justify-end mb-4">
                    <button 
                        onClick={() => navigate(`/helper/patient/${patientId}/medication/add`)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Schedule Medication
                    </button>
                </div>
            )}

            {sortedMedications.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center"
                >
                    <Pill className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Medications</h3>
                    <p className="text-slate-400">This patient has no medications scheduled.</p>
                </motion.div>
            ) : (
                sortedMedications.map((med, index) => {
                    const { status, log } = getMedicationStatus(med);

                    return (
                        <motion.div
                            key={med.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                        <Pill className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-1">{med.name}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{med.scheduledTime}</span>
                                            </div>
                                            <span className="px-2 py-0.5 bg-slate-800 rounded text-xs">
                                                {med.mealType}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {getStatusBadge(status)}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Dosage</p>
                                    <p className="text-sm font-medium text-white">{med.qtyPerDose} pill(s)</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Remaining</p>
                                    <p className="text-sm font-medium text-white">
                                        {med.remainingQty} pill(s)
                                        {med.remainingQty === 0 && (
                                            <span className="ml-2 text-xs text-red-400">(Out of stock)</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {status === 'taken' && log && (
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <p className="text-xs text-slate-500">
                                        Taken at: {new Date(log.takenTime).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}

                            {status === 'missed' && (
                                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-red-400">
                                    <AlertCircle className="w-4 h-4" />
                                    <p className="text-xs">Patient missed this medication</p>
                                </div>
                            )}
                        </motion.div>
                    );
                })
            )}
        </div>
    );
};

export default HelperMedicationView;
