import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
    Flame,
    Trophy,
    Target,
    Pill,
    Calendar,
    Clock,
    AlertCircle,
    TrendingUp,
    Award
} from 'lucide-react';
import UpcomingMeds from './UpcomingMeds';
import UpcomingAppointments from './UpcomingAppointments';
import { useHealth } from '../context/HealthContext';
import PatientScoreCard from './PatientScoreCard';

const Dashboard = () => {
    const [greeting, setGreeting] = useState('Good Morning');
    const { patient, medications, appointments, stats, takenToday } = useHealth();
    const patientName = patient?.name || patient?.full_name || 'User';

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    // Live stats from context — syncs instantly when medication is taken
    const totalMedicines = stats?.totalMedications ?? medications?.length ?? 0;
    const takenTodayCount = stats?.takenTodayCount ?? 0;
    const upcomingAppointments = stats?.upcomingAppointments ?? 0;
    const pendingDoses = stats?.pendingDoses ?? totalMedicines;
    const complianceRate = stats?.complianceRate ?? 0;
    const streakDays = takenToday?.size ?? 0;

    // Pie chart data
    const chartData = [
        { name: 'Completed', value: complianceRate, color: '#10b981' },
        { name: 'Pending', value: 100 - complianceRate, color: '#334155' }
    ];

    // Doctor remarks - Empty, ready for actual data
    const doctorRemarks = [];

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Patient Score Card */}
                <PatientScoreCard mode="patient" />

                {/* Header with Greeting */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {greeting}, {patientName} 👋
                    </h1>
                    <p className="text-slate-400 text-lg">Stay healthy and keep going strong!</p>
                </motion.div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.3)" }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <Pill className="text-emerald-400" size={24} />
                            </div>
                            <span className="text-2xl">💊</span>
                        </div>
                        <h3 className="text-slate-400 text-sm mb-1">Medicines Today</h3>
                        <p className="text-3xl font-bold text-white">{takenTodayCount}/{totalMedicines}</p>
                        <div className="mt-2 flex items-center gap-1 text-emerald-400 text-sm">
                            <TrendingUp size={14} />
                            <span>On track</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.3)" }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <Calendar className="text-blue-400" size={24} />
                            </div>
                            <span className="text-2xl">📅</span>
                        </div>
                        <h3 className="text-slate-400 text-sm mb-1">Upcoming Appointments</h3>
                        <p className="text-3xl font-bold text-white">{upcomingAppointments}</p>
                        <div className="mt-2 text-blue-400 text-sm">This week</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(251, 146, 60, 0.3)" }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                                <Clock className="text-orange-400" size={24} />
                            </div>
                            <span className="text-2xl">⏰</span>
                        </div>
                        <h3 className="text-slate-400 text-sm mb-1">Pending Doses</h3>
                        <p className="text-3xl font-bold text-white">{pendingDoses}</p>
                        <div className="mt-2 text-orange-400 text-sm">Take soon</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(234, 179, 8, 0.3)" }}
                        className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
                                <Flame className="text-yellow-400" size={24} />
                            </div>
                            <span className="text-2xl">🔥</span>
                        </div>
                        <h3 className="text-yellow-200 text-sm mb-1 font-semibold">Active Medications</h3>
                        <p className="text-3xl font-bold text-yellow-400">{totalMedicines} Meds</p>
                        <div className="mt-2 text-yellow-300 text-sm">Currently scheduled</div>
                    </motion.div>
                </div>

                {/* Upcoming Medications and Appointments - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Medications */}
                    <UpcomingMeds />

                    {/* Upcoming Appointments */}
                    <UpcomingAppointments />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Achievements & Compliance Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6"
                    >
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Trophy className="text-emerald-400" size={24} />
                            Achievements & Progress
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Achievement Badges */}
                            <div className="space-y-4">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                                            <Target className="text-emerald-400" size={20} />
                                        </div>
                                        <h3 className="font-semibold text-white">Daily Consistency</h3>
                                    </div>
                                    <p className="text-sm text-slate-400">{takenTodayCount} of {totalMedicines} medicines taken today</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${totalMedicines > 0 ? (takenTodayCount / totalMedicines) * 100 : 0}%` }}
                                                transition={{ delay: 0.8, duration: 1 }}
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                            />
                                        </div>
                                        <span className="text-xs text-emerald-400 font-semibold">{totalMedicines > 0 ? Math.round((takenTodayCount / totalMedicines) * 100) : 0}%</span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <Award className="text-blue-400" size={20} />
                                        </div>
                                        <h3 className="font-semibold text-white">Health Champion</h3>
                                    </div>
                                    <p className="text-sm text-slate-400">{complianceRate}% compliance this month</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${complianceRate}%` }}
                                                transition={{ delay: 1, duration: 1 }}
                                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                            />
                                        </div>
                                        <span className="text-xs text-blue-400 font-semibold">{complianceRate}%</span>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Compliance Pie Chart */}
                            <div className="flex flex-col items-center justify-center">
                                <h3 className="text-sm font-semibold text-slate-400 mb-4">Medication Compliance</h3>
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
                                    className="relative"
                                >
                                    <ResponsiveContainer width={200} height={200}>
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx={100}
                                                cy={100}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 1.2 }}
                                                className="text-3xl font-bold text-emerald-400"
                                            >
                                                {complianceRate}%
                                            </motion.p>
                                            <p className="text-xs text-slate-500">Complete</p>
                                        </div>
                                    </div>
                                </motion.div>
                                <div className="mt-4 flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-xs text-slate-400">Completed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                        <span className="text-xs text-slate-400">Pending</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Doctor Remarks */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                    >
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <AlertCircle className="text-blue-400" size={24} />
                            Doctor Remarks
                        </h2>

                        <div className="space-y-4">
                            {doctorRemarks.map((remark, index) => (
                                <motion.div
                                    key={remark.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    className={`p-4 rounded-xl border ${remark.priority === 'high'
                                        ? 'bg-red-500/5 border-red-500/20 animate-pulse'
                                        : 'bg-slate-800/50 border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {remark.priority === 'high' && (
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    opacity: [1, 0.7, 1]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                                            </motion.div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-white text-sm">{remark.doctor}</h3>
                                                <span className="text-xs text-slate-500">{remark.date}</span>
                                            </div>
                                            <p className={`text-sm ${remark.priority === 'high' ? 'text-red-300 font-medium' : 'text-slate-400'
                                                }`}>
                                                {remark.remark}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors duration-200 text-sm font-medium"
                        >
                            View All Remarks
                        </motion.button>
                    </motion.div>
                </div>

                {/* Additional Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <Trophy className="text-emerald-400" size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">You're doing amazing!</h3>
                            <p className="text-slate-400 text-sm">
                                You have taken {takenTodayCount} out of {totalMedicines} scheduled doses today. Keep taking your medications on time!
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors duration-200"
                        >
                            View Details
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
