import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    Phone,
    User,
    FileText,
    Plus,
    Video,
    Stethoscope,
    AlertCircle
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

const AppointmentList = () => {
    const navigate = useNavigate();

    // ============================================
    // GLOBAL STATE - Single source of truth
    // ============================================
    const { appointments } = useHealth();

    // Determine appointment type based on place
    const getAppointmentType = (place) => {
        return place.toLowerCase().includes('video') || place.toLowerCase().includes('online')
            ? 'video'
            : 'in-person';
    };


    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format time for display
    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Calculate days until appointment
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

    const getColorByType = (type) => {
        return type === 'video' ? {
            bg: 'from-blue-500/10 to-cyan-500/10',
            border: 'border-blue-500/20',
            icon: 'text-blue-400',
            iconBg: 'bg-blue-500/10',
            badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        } : {
            bg: 'from-emerald-500/10 to-teal-500/10',
            border: 'border-emerald-500/20',
            icon: 'text-emerald-400',
            iconBg: 'bg-emerald-500/10',
            badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
    };

    return (
        <div className="min-h-screen bg-slate-950 ml-64 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                                <Calendar className="text-emerald-400" size={36} />
                                My Appointments
                            </h1>
                            <p className="text-slate-400 text-lg">
                                Manage your upcoming medical appointments
                            </p>
                        </div>

                        {/* Add Appointment Button */}
                        <motion.button
                            onClick={() => navigate('/patient/appointment/add')}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 40px -10px rgba(16, 185, 129, 0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg"
                        >
                            <Plus size={20} />
                            Add Appointment
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500/20 rounded-lg">
                                <Calendar className="text-emerald-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total Appointments</p>
                                <p className="text-2xl font-bold text-white">{appointments.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <Clock className="text-blue-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">This Week</p>
                                <p className="text-2xl font-bold text-white">
                                    {appointments.filter(apt => {
                                        const days = getDaysUntil(apt.date);
                                        return days !== 'Past' && !days.includes('days');
                                    }).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                <Video className="text-purple-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Video Calls</p>
                                <p className="text-2xl font-bold text-white">
                                    {appointments.filter(apt => getAppointmentType(apt.place) === 'video').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Appointments List */}
                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {appointments.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center"
                            >
                                <Calendar className="text-slate-600 mx-auto mb-4" size={64} />
                                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                                    No Appointments Scheduled
                                </h3>
                                <p className="text-slate-500 mb-6">
                                    You don't have any upcoming appointments. Click the button above to schedule one.
                                </p>
                                <motion.button
                                    onClick={() => navigate('/patient/appointment/add')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
                                >
                                    Schedule Your First Appointment
                                </motion.button>
                            </motion.div>
                        ) : (
                            appointments.map((appointment, index) => {
                                const appointmentType = getAppointmentType(appointment.place);
                                const colors = getColorByType(appointmentType);
                                const daysUntil = getDaysUntil(appointment.date);

                                return (
                                    <motion.div
                                        key={appointment.id}
                                        layout
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 30 }}
                                        transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                                        whileHover={{
                                            y: -4,
                                            boxShadow: "0 20px 40px -15px rgba(16, 185, 129, 0.3)",
                                            transition: { duration: 0.2 }
                                        }}
                                        className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl p-6 transition-all duration-300 cursor-pointer`}
                                    >
                                        {/* Header with Doctor Info */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-start gap-4 flex-1">
                                                {/* Doctor Avatar */}
                                                <motion.div
                                                    whileHover={{ rotate: 360 }}
                                                    transition={{ duration: 0.6 }}
                                                    className={`p-4 ${colors.iconBg} rounded-xl border ${colors.border}`}
                                                >
                                                    <User className={colors.icon} size={28} />
                                                </motion.div>

                                                {/* Doctor Details */}
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="font-bold text-white text-xl mb-1">
                                                                {appointment.doctorName}
                                                            </h3>
                                                            <p className="text-sm text-slate-400 flex items-center gap-2">
                                                                <Stethoscope size={14} />
                                                                {appointment.specialty}
                                                            </p>
                                                        </div>

                                                        {/* Type Badge */}
                                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${colors.badge} flex items-center gap-1.5`}>
                                                            {appointmentType === 'video' ? (
                                                                <>
                                                                    <Video size={14} />
                                                                    Video Call
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <MapPin size={14} />
                                                                    In-Person
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Contact Number */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Phone className="text-slate-500" size={14} />
                                                        <a
                                                            href={`tel:${appointment.contactNumber}`}
                                                            className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                                                        >
                                                            {appointment.contactNumber}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Purpose */}
                                        <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className={colors.icon} size={16} />
                                                <p className="text-xs text-slate-400 font-medium uppercase">Purpose</p>
                                            </div>
                                            <p className="text-white font-semibold">
                                                {appointment.purpose}
                                            </p>
                                        </div>

                                        {/* Appointment Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            {/* Date */}
                                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className="text-slate-500" size={14} />
                                                    <p className="text-xs text-slate-500 font-medium">Date</p>
                                                </div>
                                                <p className="text-sm font-semibold text-white">
                                                    {formatDate(appointment.date)}
                                                </p>
                                                <p className={`text-xs mt-1 ${daysUntil === 'Today' ? 'text-emerald-400' :
                                                    daysUntil === 'Tomorrow' ? 'text-blue-400' :
                                                        'text-slate-500'
                                                    }`}>
                                                    {daysUntil}
                                                </p>
                                            </div>

                                            {/* Time */}
                                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Clock className="text-slate-500" size={14} />
                                                    <p className="text-xs text-slate-500 font-medium">Time</p>
                                                </div>
                                                <p className="text-sm font-semibold text-white">
                                                    {formatTime(appointment.time)}
                                                </p>
                                            </div>

                                            {/* Location */}
                                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {appointmentType === 'video' ? (
                                                        <Video className="text-slate-500" size={14} />
                                                    ) : (
                                                        <MapPin className="text-slate-500" size={14} />
                                                    )}
                                                    <p className="text-xs text-slate-500 font-medium">Location</p>
                                                </div>
                                                <p className="text-sm font-semibold text-white line-clamp-2">
                                                    {appointment.place}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Remarks */}
                                        {appointment.remarks && (
                                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="text-orange-400 flex-shrink-0 mt-0.5" size={16} />
                                                    <div>
                                                        <p className="text-xs text-orange-300 font-medium mb-1">Important Notes</p>
                                                        <p className="text-sm text-orange-200">
                                                            {appointment.remarks}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`flex-1 py-2.5 ${colors.iconBg} ${colors.icon} rounded-lg font-semibold text-sm border ${colors.border} hover:bg-opacity-80 transition-all duration-200`}
                                            >
                                                {appointmentType === 'video' ? 'Join Video Call' : 'Get Directions'}
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-lg font-semibold text-sm border border-slate-700 hover:bg-slate-700 transition-all duration-200"
                                            >
                                                Reschedule
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AppointmentList;
