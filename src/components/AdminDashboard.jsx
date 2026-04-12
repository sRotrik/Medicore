/**
 * Admin Dashboard
 * Shows overview of all helpers, patients, and system stats
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Activity,
    Users,
    UserCheck,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    BarChart3,
    ArrowRight,
    Shield
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [systemStats, setSystemStats] = useState({
        totalHelpers: 0,
        activeHelpers: 0,
        inactiveHelpers: 0,
        totalPatients: 0,
        totalMedications: 0,
        totalAppointments: 0,
        avgComplianceRate: 0,
        criticalAlerts: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSystemStats();
    }, []);

    const fetchSystemStats = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            // Fetch stats from backend (you'll need to create this endpoint)
            const response = await fetch('http://localhost:5000/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSystemStats(data.stats || systemStats);
                setRecentActivity(data.recentActivity || []);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Keep default values (all zeros) if API fails
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: 'Total Users',
            value: systemStats.totalPatients + systemStats.totalHelpers,
            icon: Users,
            color: 'emerald',
            subtext: `${systemStats.totalPatients} patients`
        },
        {
            label: 'Total Patients',
            value: systemStats.totalPatients,
            icon: UserCheck,
            color: 'blue',
            subtext: 'Registered patients'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Header */}
            <div className="bg-slate-900/50 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <Shield className="text-indigo-500 w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">MediCore Admin</h1>
                            <p className="text-xs text-slate-500">System Management Portal</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Admin Dashboard 🛡️
                    </h2>
                    <p className="text-slate-400">Monitor and manage the entire MediCore system</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 bg-${stat.color}-500/10 rounded-lg border border-${stat.color}-500/20`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                            <p className="text-xs text-slate-500">{stat.subtext}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Manage Helpers */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/admin/helpers')}
                        className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl border border-emerald-500/50 hover:from-emerald-500 hover:to-teal-500 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-semibold text-lg">Manage Helpers</p>
                                <p className="text-emerald-100 text-sm">View, monitor & control helper accounts</p>
                            </div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                    </motion.button>

                    {/* Manage Patients */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/admin/patients')}
                        className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl border border-blue-500/50 hover:from-blue-500 hover:to-indigo-500 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-lg">
                                <UserCheck className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-semibold text-lg">Manage Patients</p>
                                <p className="text-blue-100 text-sm">View patient stats & reassign helpers</p>
                            </div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                    </motion.button>

                    {/* System Analytics */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/admin/analytics')}
                        className="flex items-center justify-between p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <BarChart3 className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-semibold text-lg">System Analytics</p>
                                <p className="text-slate-400 text-sm">View detailed reports & insights</p>
                            </div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-6"
                >
                    <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                <p className="text-slate-500">No recent activity</p>
                                <p className="text-sm text-slate-600 mt-1">Activity will appear here as users interact with the system</p>
                            </div>
                        ) : (
                            recentActivity.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                                    className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg"
                                >
                                    <div className={`p-2 rounded-lg ${activity.status === 'success'
                                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                                        : activity.status === 'warning'
                                            ? 'bg-orange-500/10 border border-orange-500/20'
                                            : 'bg-red-500/10 border border-red-500/20'
                                        }`}>
                                        {activity.status === 'success' ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        ) : activity.status === 'warning' ? (
                                            <AlertCircle className="w-5 h-5 text-orange-400" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-white">
                                            {activity.type === 'helper_joined' && `Helper ${activity.helper} joined the system`}
                                            {activity.type === 'patient_assigned' && `Patient ${activity.patient} assigned to ${activity.helper}`}
                                            {activity.type === 'compliance_alert' && `Low compliance alert for ${activity.patient}`}
                                            {activity.type === 'helper_deactivated' && `Helper ${activity.helper} account deactivated`}
                                        </p>
                                        <p className="text-xs text-slate-500">{activity.time}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
