/**
 * Admin Helper Detail View
 * Shows complete helper profile and all their assigned patients
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Shield,
    User,
    Phone,
    Calendar,
    CreditCard,
    CheckCircle,
    Users,
    TrendingUp,
    Clock,
    Activity,
    ChevronRight
} from 'lucide-react';

const AdminHelperDetail = () => {
    const navigate = useNavigate();
    const { helperId } = useParams();

    // Mock helper data (would come from global state)
    const helperData = {
        id: helperId,
        fullName: 'John Doe',
        age: 28,
        gender: 'Male',
        contactNumber: '9876543210',
        verificationId: 'ABCD1234567890',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        joinedDate: '2026-01-10',
        status: 'active',
        verified: true,
        stats: {
            assignedPatients: 3,
            tasksCompleted: 24,
            avgResponseTime: '< 5 min',
            performanceScore: 92,
            daysActive: 5
        }
    };

    // Mock assigned patients
    const assignedPatients = [
        {
            id: 1,
            name: 'Sarah Johnson',
            age: 45,
            gender: 'Female',
            phone: '9876543210',
            profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
            complianceRate: 85,
            medicationsToday: 5,
            medicationsTaken: 4,
            upcomingAppointments: 2
        },
        {
            id: 2,
            name: 'Michael Chen',
            age: 62,
            gender: 'Male',
            phone: '9123456780',
            profileImage: 'https://randomuser.me/api/portraits/men/52.jpg',
            complianceRate: 95,
            medicationsToday: 4,
            medicationsTaken: 4,
            upcomingAppointments: 1
        },
        {
            id: 3,
            name: 'Emily Rodriguez',
            age: 38,
            gender: 'Female',
            phone: '9234567890',
            profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
            complianceRate: 72,
            medicationsToday: 6,
            medicationsTaken: 3,
            upcomingAppointments: 3
        }
    ];

    const handleToggleStatus = () => {
        const action = helperData.status === 'active' ? 'deactivate' : 'activate';
        const confirmed = window.confirm(
            `Are you sure you want to ${action} this helper account?`
        );

        if (confirmed) {
            console.log(`${action} helper ${helperId}`);
            alert(`Helper account ${action}d successfully!`);
            navigate('/admin/helpers');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Header */}
            <div className="bg-slate-900/50 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin/helpers')}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-400" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                    <Shield className="text-indigo-500 w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">MediCore Admin</h1>
                                    <p className="text-xs text-slate-500">Helper Details</p>
                                </div>
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
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Helper Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 mb-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Profile Image */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-indigo-500/20">
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
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${helperData.status === 'active'
                                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                    }`}>
                                    {helperData.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                                {helperData.verified && (
                                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-medium">
                                        Verified
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

                        {/* Action Button */}
                        <button
                            onClick={handleToggleStatus}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${helperData.status === 'active'
                                    ? 'bg-red-600 hover:bg-red-500 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                        >
                            {helperData.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                        </button>
                    </div>
                </motion.div>

                {/* Performance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {[
                        { label: 'Assigned Patients', value: helperData.stats.assignedPatients, icon: Users, color: 'emerald' },
                        { label: 'Tasks Completed', value: helperData.stats.tasksCompleted, icon: CheckCircle, color: 'blue' },
                        { label: 'Performance Score', value: `${helperData.stats.performanceScore}%`, icon: TrendingUp, color: 'purple' },
                        { label: 'Response Time', value: helperData.stats.avgResponseTime, icon: Clock, color: 'orange' },
                        { label: 'Days Active', value: helperData.stats.daysActive, icon: Activity, color: 'pink' }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-6"
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

                {/* Assigned Patients */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <h3 className="text-2xl font-bold text-white mb-6">
                        Assigned Patients ({assignedPatients.length})
                    </h3>

                    <div className="space-y-4">
                        {assignedPatients.map((patient, index) => (
                            <motion.div
                                key={patient.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                                onClick={() => navigate(`/admin/patient/${patient.id}`)}
                                className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-indigo-500/30 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-700 group-hover:border-indigo-500/30 transition-all">
                                            <img
                                                src={patient.profileImage}
                                                alt={patient.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-2">
                                                {patient.name}
                                            </h4>
                                            <div className="flex items-center gap-6 mb-4 text-sm text-slate-400">
                                                <span>{patient.age}y, {patient.gender}</span>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{patient.phone}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="bg-slate-800/50 rounded-lg p-3">
                                                    <p className="text-xs text-slate-500 mb-1">Medications Today</p>
                                                    <p className="text-lg font-bold text-white">
                                                        {patient.medicationsTaken}/{patient.medicationsToday}
                                                    </p>
                                                </div>

                                                <div className="bg-slate-800/50 rounded-lg p-3">
                                                    <p className="text-xs text-slate-500 mb-1">Compliance Rate</p>
                                                    <p className="text-lg font-bold text-emerald-400">{patient.complianceRate}%</p>
                                                </div>

                                                <div className="bg-slate-800/50 rounded-lg p-3">
                                                    <p className="text-xs text-slate-500 mb-1">Appointments</p>
                                                    <p className="text-lg font-bold text-white">{patient.upcomingAppointments}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminHelperDetail;
