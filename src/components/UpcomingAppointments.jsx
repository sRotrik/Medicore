import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, FileText, MapPin, Video, Phone } from 'lucide-react';
import { useHealth } from '../context/HealthContext';

const UpcomingAppointments = () => {
    const navigate = useNavigate();
    const { appointments } = useHealth();
    const getColorClasses = (color) => {
        const colors = {
            emerald: {
                bg: 'from-emerald-500/10 to-teal-500/10',
                border: 'border-emerald-500/20',
                icon: 'text-emerald-400',
                iconBg: 'bg-emerald-500/10',
                badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            },
            blue: {
                bg: 'from-blue-500/10 to-cyan-500/10',
                border: 'border-blue-500/20',
                icon: 'text-blue-400',
                iconBg: 'bg-blue-500/10',
                badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            },
            purple: {
                bg: 'from-purple-500/10 to-pink-500/10',
                border: 'border-purple-500/20',
                icon: 'text-purple-400',
                iconBg: 'bg-purple-500/10',
                badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            }
        };

        return colors[color] || colors.emerald;
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'video':
                return <Video size={16} />;
            case 'phone':
                return <Phone size={16} />;
            default:
                return <MapPin size={16} />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="text-blue-400" size={24} />
                    Upcoming Appointments
                </h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/patient/appointment')}
                    className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                >
                    View All
                </motion.button>
            </div>

            <div className="space-y-4">
                {appointments.map((appointment, index) => {
                    const colorClasses = getColorClasses(appointment.color);

                    return (
                        <motion.div
                            key={appointment.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.15, type: "spring", stiffness: 100 }}
                            whileHover={{
                                y: -4,
                                boxShadow: "0 20px 40px -15px rgba(59, 130, 246, 0.3)",
                                transition: { duration: 0.2 }
                            }}
                            className={`bg-gradient-to-br ${colorClasses.bg} border ${colorClasses.border} rounded-xl p-5 transition-all duration-300 cursor-pointer`}
                        >
                            {/* Header with Doctor Info */}
                            <div className="flex items-start gap-4 mb-4">
                                {/* Doctor Avatar */}
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                    className={`p-3 ${colorClasses.iconBg} rounded-xl border ${colorClasses.border}`}
                                >
                                    <User className={colorClasses.icon} size={24} />
                                </motion.div>

                                {/* Doctor Details */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-lg mb-1">
                                        {appointment.doctorName}
                                    </h3>
                                    <p className="text-sm text-slate-400">{appointment.specialty}</p>
                                </div>

                                {/* Type Badge */}
                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${colorClasses.badge} flex items-center gap-1.5`}>
                                    {getTypeIcon(appointment.type)}
                                    {appointment.type === 'video' ? 'Video Call' :
                                        appointment.type === 'phone' ? 'Phone Call' : 'In-Person'}
                                </span>
                            </div>

                            {/* Appointment Details Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {/* Date */}
                                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="text-slate-500" size={14} />
                                        <p className="text-xs text-slate-500 font-medium">Date</p>
                                    </div>
                                    <p className="text-sm font-semibold text-white">
                                        {appointment.date}
                                    </p>
                                </div>

                                {/* Time */}
                                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="text-slate-500" size={14} />
                                        <p className="text-xs text-slate-500 font-medium">Time</p>
                                    </div>
                                    <p className="text-sm font-semibold text-white">
                                        {appointment.time}
                                    </p>
                                </div>
                            </div>

                            {/* Purpose */}
                            <div className="bg-slate-800/30 rounded-lg p-3 mb-3 border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className={colorClasses.icon} size={16} />
                                    <p className="text-xs text-slate-400 font-medium">Purpose</p>
                                </div>
                                <p className="text-sm text-white font-medium">
                                    {appointment.purpose}
                                </p>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-2 mb-4">
                                {appointment.type === 'video' ? (
                                    <Video className="text-slate-500 flex-shrink-0 mt-0.5" size={16} />
                                ) : (
                                    <MapPin className="text-slate-500 flex-shrink-0 mt-0.5" size={16} />
                                )}
                                <p className="text-sm text-slate-400">
                                    {appointment.location}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex-1 py-2.5 ${colorClasses.iconBg} ${colorClasses.icon} rounded-lg font-semibold text-sm border ${colorClasses.border} hover:bg-opacity-80 transition-all duration-200`}
                                >
                                    View Details
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-lg font-semibold text-sm border border-slate-700 hover:bg-slate-700 transition-all duration-200"
                                >
                                    Reschedule
                                </motion.button>
                            </div>

                            {/* Countdown Timer (Optional Enhancement) */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 + index * 0.15 }}
                                className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-center gap-2 text-xs text-slate-500"
                            >
                                <Clock size={12} />
                                <span>
                                    {index === 0 ? 'In 3 days' : index === 1 ? 'In 5 days' : 'In 10 days'}
                                </span>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Add New Appointment Button */}
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/patient/appointment/add')}
                className="w-full mt-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
                <Calendar size={18} />
                Book New Appointment
            </motion.button>
        </motion.div>
    );
};

export default UpcomingAppointments;
