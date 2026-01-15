/**
 * Helper Dashboard
 * Shows helper's profile information and navigation to patient list
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Users,
    Phone,
    CreditCard,
    Calendar,
    Activity,
    ArrowRight,
    CheckCircle,
    Clock
} from 'lucide-react';

const HelperDashboard = () => {
    const navigate = useNavigate();

    // Mock helper data (would come from global state after signup)
    const helperData = {
        fullName: 'John Doe',
        age: 28,
        gender: 'Male',
        contactNumber: '9876543210',
        verificationId: 'ABCD1234567890',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        joinedDate: '2026-01-10',
        assignedPatients: 3,
        tasksCompleted: 24,
        verified: true
    };

    const stats = [
        { label: 'Assigned Patients', value: helperData.assignedPatients, icon: Users, color: 'emerald' },
        { label: 'Tasks Completed', value: helperData.tasksCompleted, icon: CheckCircle, color: 'blue' },
        { label: 'Days Active', value: '5', icon: Calendar, color: 'purple' },
        { label: 'Response Time', value: '< 5 min', icon: Clock, color: 'orange' }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Header */}
            <div className="bg-slate-900/50 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <Activity className="text-emerald-500 w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">MediCore</h1>
                            <p className="text-xs text-slate-500">Helper Portal</p>
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
                        Welcome back, {helperData.fullName.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-slate-400">Here's your helper dashboard overview</p>
                </motion.div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 mb-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Profile Image */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-emerald-500/20">
                                <img
                                    src={helperData.profileImage}
                                    alt={helperData.fullName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {helperData.verified && (
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2 border-4 border-slate-900">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold text-white">{helperData.fullName}</h3>
                                {helperData.verified && (
                                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-medium">
                                        Verified Helper
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center gap-3 text-slate-300">
                                    <User className="w-5 h-5 text-slate-500" />
                                    <div>
                                        <p className="text-xs text-slate-500">Age & Gender</p>
                                        <p className="text-sm font-medium">{helperData.age} years, {helperData.gender}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-slate-300">
                                    <Phone className="w-5 h-5 text-slate-500" />
                                    <div>
                                        <p className="text-xs text-slate-500">Contact Number</p>
                                        <p className="text-sm font-medium">{helperData.contactNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-slate-300">
                                    <CreditCard className="w-5 h-5 text-slate-500" />
                                    <div>
                                        <p className="text-xs text-slate-500">Verification ID</p>
                                        <p className="text-sm font-medium">{helperData.verificationId}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-slate-300">
                                    <Calendar className="w-5 h-5 text-slate-500" />
                                    <div>
                                        <p className="text-xs text-slate-500">Joined Date</p>
                                        <p className="text-sm font-medium">{new Date(helperData.joinedDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-emerald-500/30 transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 bg-${stat.color}-500/10 rounded-lg border border-${stat.color}-500/20`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-sm text-slate-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-8"
                >
                    <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* View Patients Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/helper/patients')}
                            className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl border border-emerald-500/50 hover:from-emerald-500 hover:to-teal-500 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-semibold text-lg">View Patient Details</p>
                                    <p className="text-emerald-100 text-sm">Manage {helperData.assignedPatients} assigned patients</p>
                                </div>
                            </div>
                            <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                        </motion.button>

                        {/* Profile Settings */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-between p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-700 rounded-lg">
                                    <User className="w-6 h-6 text-slate-300" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-semibold text-lg">Edit Profile</p>
                                    <p className="text-slate-400 text-sm">Update your information</p>
                                </div>
                            </div>
                            <ArrowRight className="w-6 h-6 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HelperDashboard;
