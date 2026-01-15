import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video } from 'lucide-react';

const Appointment = () => {
    const appointments = [
        {
            id: 1,
            doctor: 'Dr. Sarah Johnson',
            specialty: 'Cardiologist',
            date: 'Jan 18, 2026',
            time: '10:00 AM',
            type: 'In-person',
            location: 'MediCore Clinic, Room 302'
        },
        {
            id: 2,
            doctor: 'Dr. Michael Chen',
            specialty: 'General Physician',
            date: 'Jan 20, 2026',
            time: '02:30 PM',
            type: 'Video Call',
            location: 'Online Consultation'
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 ml-64 p-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-white mb-2">Appointments</h1>
                    <p className="text-slate-400">Your upcoming medical appointments</p>
                </motion.div>

                <div className="grid gap-6">
                    {appointments.map((apt, index) => (
                        <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                            <Calendar className="text-blue-400" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{apt.doctor}</h3>
                                            <p className="text-sm text-slate-400">{apt.specialty}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={16} />
                                            <span className="text-sm">{apt.date} at {apt.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            {apt.type === 'Video Call' ? <Video size={16} /> : <MapPin size={16} />}
                                            <span className="text-sm">{apt.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    {apt.type === 'Video Call' ? 'Join Call' : 'View Details'}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Appointment;
