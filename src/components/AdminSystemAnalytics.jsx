/**
 * Admin System Analytics
 * Comprehensive analytics dashboard showing all system data
 * Synced with patient medications, appointments, and helper performance
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
    ArrowLeft,
    Shield,
    Users,
    Activity,
    TrendingUp,
    TrendingDown,
    Calendar,
    Pill,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    BarChart3,
    PieChart,
    Target
} from 'lucide-react';

const AdminSystemAnalytics = () => {
    const navigate = useNavigate();
    const [stats, setStats] = React.useState({
        system: { health: 'Loading', complianceRate: 0 },
        helpers: { active: 0, total: 0, inactive: 0, avgPerformance: 0 }
    });

    React.useEffect(() => {
        fetchSystemStats();
    }, []);

    const fetchSystemStats = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const d = data.stats || {};
                
                const compliance = d.avgComplianceRate || 0;
                const healthType = compliance >= 80 ? 'Excellent' : compliance >= 60 ? 'Good' : 'Needs Attention';

                setStats({
                    system: { health: healthType, complianceRate: compliance },
                    helpers: { 
                        active: d.activeHelpers || 0, 
                        total: d.totalHelpers || 0, 
                        inactive: d.inactiveHelpers || 0, 
                        avgPerformance: d.avgHelperPerformance || 0 
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        }
    };

    // Overview Cards
    const overviewCards = [
        {
            label: 'Active Helpers',
            value: stats.helpers.active,
            icon: Users,
            color: 'purple',
            subtext: `${stats.helpers.total} total helpers`
        },
        {
            label: 'System Compliance',
            value: `${stats.system.complianceRate}%`,
            icon: Target,
            color: stats.system.complianceRate >= 80 ? 'emerald' : 'orange',
            subtext: stats.system.health
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Header */}
            <div className="bg-slate-900/50 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin/dashboard')}
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
                                    <p className="text-xs text-slate-500">System Analytics</p>
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

                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-8 h-8 text-indigo-400" />
                        <h2 className="text-3xl font-bold text-white">System Analytics</h2>
                    </div>
                    <p className="text-slate-400">Real-time data synced across all portals</p>
                </motion.div>

                {/* System Health Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className={`mb-8 p-6 rounded-xl border ${stats.system.complianceRate >= 80
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : stats.system.complianceRate >= 60
                            ? 'bg-orange-500/10 border-orange-500/20'
                            : 'bg-red-500/10 border-red-500/20'
                        }`}
                >
                    <div className="flex items-center gap-4">
                        {stats.system.complianceRate >= 80 ? (
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        ) : (
                            <AlertCircle className="w-8 h-8 text-orange-400" />
                        )}
                        <div>
                            <h3 className={`text-xl font-bold ${stats.system.complianceRate >= 80 ? 'text-emerald-400' : 'text-orange-400'
                                }`}>
                                System Health: {stats.system.health}
                            </h3>
                            <p className="text-slate-300">
                                Overall compliance rate: {stats.system.complianceRate}%
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {overviewCards.map((card, index) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 bg-${card.color}-500/10 rounded-lg border border-${card.color}-500/20`}>
                                    <card.icon className={`w-6 h-6 text-${card.color}-400`} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
                            <p className="text-sm text-slate-400 mb-1">{card.label}</p>
                            <p className="text-xs text-slate-500">{card.subtext}</p>
                        </motion.div>
                    ))}
                </div>



                {/* Helper Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-bold text-white">Helper Performance Overview</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-slate-400 text-sm mb-2">Total Helpers</p>
                            <p className="text-4xl font-bold text-white">{stats.helpers.total}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-400 text-sm mb-2">Active</p>
                            <p className="text-4xl font-bold text-emerald-400">{stats.helpers.active}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-400 text-sm mb-2">Inactive</p>
                            <p className="text-4xl font-bold text-red-400">{stats.helpers.inactive}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-400 text-sm mb-2">Avg Performance</p>
                            <p className="text-4xl font-bold text-purple-400">{stats.helpers.avgPerformance}%</p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className="mt-8 flex gap-4"
                >
                    <button
                        onClick={() => navigate('/admin/helpers')}
                        className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <Users className="w-5 h-5" />
                        Manage Helpers
                    </button>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminSystemAnalytics;
