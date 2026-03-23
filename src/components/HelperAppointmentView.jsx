/**
 * Read-Only Appointment View for Helpers
 * Shows patient's appointments without edit/delete buttons
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    User,
    Phone,
    MapPin,
    Video,
    FileText,
    AlertCircle
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

const HelperAppointmentView = ({ appointments: propAppointments }) => {
    const { appointments: contextAppointments } = useHealth();
    const appointments = propAppointments || contextAppointments || [];

    const getDaysUntil = (dateString) => {
        const appointmentDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        appointmentDate.setHours(0, 0, 0, 0);
        const diffTime = appointmentDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 0) return 'Past';
        return `In ${diffDays} days`;
    };

    const getAppointmentType = (place) => {
        const placeLower = place.toLowerCase();
        if (placeLower.includes('video') || placeLower.includes('online') || placeLower.includes('virtual')) {
            return 'video';
        }
        return 'in-person';
    };

    const sortedAppointments = [...appointments].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    const upcomingAppointments = sortedAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return aptDate >= today;
    });

    const pastAppointments = sortedAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return aptDate < today;
    });

    const AppointmentCard = ({ appointment, isPast = false }) => {
        const daysUntil = getDaysUntil(appointment.date);
        const appointmentType = getAppointmentType(appointment.place);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-slate-900 rounded-xl border ${isPast ? 'border-slate-800 opacity-60' : 'border-slate-800'
                    } p-6 hover:border-slate-700 transition-all`}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl border ${appointmentType === 'video'
                            ? 'bg-blue-500/10 border-blue-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/20'
                            }`}>
                            {appointmentType === 'video' ? (
                                <Video className="w-6 h-6 text-blue-400" />
                            ) : (
                                <MapPin className="w-6 h-6 text-emerald-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">
                                Dr. {appointment.doctorName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <span className={`px-2 py-0.5 rounded text-xs ${appointmentType === 'video'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'bg-emerald-500/10 text-emerald-400'
                                    }`}>
                                    {appointmentType === 'video' ? 'Video Call' : 'In-Person'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${daysUntil === 'Today'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : daysUntil === 'Tomorrow'
                            ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                            : daysUntil === 'Past'
                                ? 'bg-slate-800 border border-slate-700 text-slate-500'
                                : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                        }`}>
                        {daysUntil}
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3 text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <div>
                            <p className="text-xs text-slate-500">Date</p>
                            <p className="text-sm font-medium">
                                {new Date(appointment.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-300">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <div>
                            <p className="text-xs text-slate-500">Time</p>
                            <p className="text-sm font-medium">{appointment.time}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-300">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <div>
                            <p className="text-xs text-slate-500">Contact</p>
                            <p className="text-sm font-medium">{appointment.contact}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-300">
                        {appointmentType === 'video' ? (
                            <Video className="w-4 h-4 text-slate-500" />
                        ) : (
                            <MapPin className="w-4 h-4 text-slate-500" />
                        )}
                        <div>
                            <p className="text-xs text-slate-500">Location</p>
                            <p className="text-sm font-medium">{appointment.place}</p>
                        </div>
                    </div>
                </div>

                {/* Remarks */}
                {appointment.remarks && (
                    <div className="pt-4 border-t border-slate-800">
                        <div className="flex items-start gap-2 text-slate-400">
                            <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Remarks</p>
                                <p className="text-sm">{appointment.remarks}</p>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Upcoming Appointments */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">
                    Upcoming Appointments ({upcomingAppointments.length})
                </h3>
                {upcomingAppointments.length === 0 ? (
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
                        <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400">No upcoming appointments</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingAppointments.map((appointment) => (
                            <AppointmentCard key={appointment.id} appointment={appointment} />
                        ))}
                    </div>
                )}
            </div>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">
                        Past Appointments ({pastAppointments.length})
                    </h3>
                    <div className="space-y-4">
                        {pastAppointments.map((appointment) => (
                            <AppointmentCard key={appointment.id} appointment={appointment} isPast />
                        ))}
                    </div>
                </div>
            )}

            {appointments.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center"
                >
                    <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Appointments</h3>
                    <p className="text-slate-400">This patient has no appointments scheduled.</p>
                </motion.div>
            )}
        </div>
    );
};

export default HelperAppointmentView;
