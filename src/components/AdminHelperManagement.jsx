/**
 * Admin Helper Management
 * View all helpers, monitor performance, activate/deactivate accounts
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Shield,
    Users,
    Search,
    CheckCircle,
    XCircle,
    TrendingUp,
    TrendingDown,
    Phone,
    Calendar,
    AlertCircle,
    UserCheck,
    UserX,
    ChevronRight,
    Trash2,
    Mail
} from 'lucide-react';

const AdminHelperManagement = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [helpers, setHelpers] = useState([]);
    const [loading, setLoading] = useState(true);
    // Track which helper is having feedback emails sent (by id)
    const [requestingFeedback, setRequestingFeedback] = useState({});
    const [feedbackResults, setFeedbackResults] = useState({});

    const handleRequestFeedback = async (helperId, helperName) => {
        if (!window.confirm(`Send feedback emails to all patients of ${helperName}?`)) return;
        setRequestingFeedback(prev => ({ ...prev, [helperId]: true }));
        setFeedbackResults(prev => ({ ...prev, [helperId]: '' }));
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(
                `http://localhost:5000/api/admin/helpers/${helperId}/request-feedback`,
                { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            setFeedbackResults(prev => ({
                ...prev,
                [helperId]: data.success
                    ? `✅ Sent to ${data.sent}/${data.total} patient(s)`
                    : `❌ ${data.message}`
            }));
        } catch {
            setFeedbackResults(prev => ({ ...prev, [helperId]: '❌ Network error' }));
        } finally {
            setRequestingFeedback(prev => ({ ...prev, [helperId]: false }));
            setTimeout(() => setFeedbackResults(prev => ({ ...prev, [helperId]: '' })), 6000);
        }
    };

    useEffect(() => {
        fetchHelpers();
    }, []);

    const fetchHelpers = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            // Fetch helpers from backend
            const response = await fetch('http://localhost:5000/api/admin/helpers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setHelpers(data.helpers || []);
            }
        } catch (error) {
            console.error('Error fetching helpers:', error);
            // Keep empty array if API fails
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (helperId, currentStatus) => {
        const action = currentStatus === 'active' ? 'deactivate' : 'activate';
        const confirmed = window.confirm(
            `Are you sure you want to ${action} this helper account?`
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem('accessToken');
            const endpoint = currentStatus === 'active' ? 'reject' : 'approve';

            const response = await fetch(`http://localhost:5000/api/admin/helpers/${helperId}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(data.message);
                // Refresh helper list
                fetchHelpers();
            } else {
                alert(data.message || `Failed to ${action} helper`);
            }
        } catch (error) {
            console.error(`Error ${action}ing helper:`, error);
            alert(`Error ${action}ing helper. Please try again.`);
        }
    };

    const handleDeleteHelper = async (helperId, helperName) => {
        const confirmed = window.confirm(
            `⚠️ WARNING: This will PERMANENTLY DELETE the helper account "${helperName}" and all related data.\n\nThis action CANNOT be undone!\n\nAre you absolutely sure you want to proceed?`
        );

        if (!confirmed) return;

        // Double confirmation for safety
        const doubleConfirm = window.confirm(
            `Final confirmation: Type YES in the next prompt to delete "${helperName}"`
        );

        if (!doubleConfirm) return;

        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`http://localhost:5000/api/admin/helpers/${helperId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(`✅ ${data.message}`);
                // Refresh helper list
                fetchHelpers();
            } else {
                alert(`❌ ${data.message || 'Failed to delete helper'}`);
            }
        } catch (error) {
            console.error('Error deleting helper:', error);
            alert('❌ Error deleting helper. Please try again.');
        }
    };

    const filteredHelpers = helpers.filter(helper => {
        const matchesSearch = helper.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            helper.verificationId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || helper.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const activeCount = helpers.filter(h => h.status === 'active').length;
    const inactiveCount = helpers.filter(h => h.status === 'inactive').length;

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
                                    <p className="text-xs text-slate-500">Helper Management</p>
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
                    <h2 className="text-3xl font-bold text-white mb-2">Helper Management</h2>
                    <p className="text-slate-400">Monitor and control all helper accounts</p>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-slate-900 rounded-xl border border-slate-800 p-6"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-400 text-sm">Total Helpers</p>
                            <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{helpers.length}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-slate-900 rounded-xl border border-slate-800 p-6"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-400 text-sm">Active Helpers</p>
                            <UserCheck className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{activeCount}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-slate-900 rounded-xl border border-slate-800 p-6"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-400 text-sm">Inactive Helpers</p>
                            <UserX className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{inactiveCount}</p>
                    </motion.div>
                </div>

                {/* Search and Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by name or verification ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white placeholder-slate-500 transition-all outline-none"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-3 rounded-xl font-medium transition-all ${filterStatus === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterStatus('active')}
                                className={`px-4 py-3 rounded-xl font-medium transition-all ${filterStatus === 'active'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilterStatus('inactive')}
                                className={`px-4 py-3 rounded-xl font-medium transition-all ${filterStatus === 'inactive'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Helper List */}
                <div className="space-y-4">
                    {filteredHelpers.map((helper, index) => (
                        <motion.div
                            key={helper.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                {/* Helper Info */}
                                <div className="flex items-start gap-4 flex-1">
                                    {/* Profile Image */}
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-700">
                                            <img
                                                src={helper.profileImage}
                                                alt={helper.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {helper.verified && (
                                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-slate-900">
                                                <CheckCircle className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white">{helper.fullName}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${helper.status === 'active'
                                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                                }`}>
                                                {helper.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-6 mb-4 text-sm text-slate-400">
                                            <span>{helper.age}y, {helper.gender}</span>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                <span>{helper.contactNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>Joined {new Date(helper.joinedDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="bg-slate-800/50 rounded-lg p-3 inline-flex items-center gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Assigned Patients</p>
                                                    <p className="text-lg font-bold text-white">{helper.stats.assignedPatients}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 ml-4 min-w-[140px]">
                                    <button
                                        onClick={() => navigate(`/admin/helper/${helper.id}`)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                                    >
                                        View Details
                                        <ChevronRight className="w-4 h-4" />
                                    </button>

                                    {/* Request Feedback Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleRequestFeedback(helper.id, helper.fullName)}
                                        disabled={requestingFeedback[helper.id]}
                                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50
                                            text-white rounded-lg font-medium transition-all flex items-center gap-2"
                                    >
                                        <Mail className="w-4 h-4" />
                                        {requestingFeedback[helper.id] ? 'Sending...' : 'Request Feedback'}
                                    </motion.button>

                                    {/* Result message */}
                                    {feedbackResults[helper.id] && (
                                        <p className="text-xs text-center font-medium"
                                            style={{ color: feedbackResults[helper.id].startsWith('✅') ? '#34d399' : '#f87171' }}
                                        >
                                            {feedbackResults[helper.id]}
                                        </p>
                                    )}

                                    <button
                                        onClick={() => handleToggleStatus(helper.id, helper.status)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            helper.status === 'active'
                                                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                        }`}
                                    >
                                        {helper.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteHelper(helper.id, helper.fullName)}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredHelpers.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center"
                    >
                        <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Helpers Found</h3>
                        <p className="text-slate-400">Try adjusting your search or filter criteria.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminHelperManagement;
