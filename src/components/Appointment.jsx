import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video, Plus, Loader2 } from 'lucide-react';

const Appointment = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch('http://localhost:5000/api/patient/appointments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            console.log('📅 Appointments response:', data);

            if (data.success) {
                setAppointments(data.data || []);
            } else {
                setError(data.message || 'Failed to fetch appointments');
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Appointments</h1>
                        <p className="text-slate-400">Your upcoming medical appointments</p>
                    </div>
                    <motion.button
                        onClick={() => navigate('/patient/appointment/add')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
                    >
                        <Plus size={20} />
                        Add Appointment
                    </motion.button>
                </motion.div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {appointments.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center"
                    >
                        <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Appointments Yet</h3>
                        <p className="text-slate-400 mb-6">You haven't scheduled any appointments</p>
                        <motion.button
                            onClick={() => navigate('/patient/appointment/add')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Schedule Your First Appointment
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="grid gap-6">
                        {appointments.map((apt, index) => (
                            <motion.div
                                key={apt.appointment_id}
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
                                                <h3 className="text-lg font-semibold text-white">{apt.doctor_name}</h3>
                                                {apt.specialization && (
                                                    <p className="text-sm text-slate-400">{apt.specialization}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock size={16} />
                                                <span className="text-sm">
                                                    {formatDate(apt.appointment_date)} at {formatTime(apt.appointment_time)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <MapPin size={16} />
                                                <span className="text-sm">{apt.hospital_name || apt.address}</span>
                                            </div>
                                        </div>

                                        {apt.reason && (
                                            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                                                <p className="text-sm text-slate-300">{apt.reason}</p>
                                            </div>
                                        )}

                                        <div className="mt-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                apt.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    apt.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                                }`}>
                                                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        View Details
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointment;

