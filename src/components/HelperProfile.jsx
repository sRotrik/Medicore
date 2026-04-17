import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Save, Activity, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelperProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        email: '',
        mobile: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '', isDeactivated: false });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/helper/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setProfile({
                    email: data.data.email || '',
                    mobile: data.data.mobile || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '', isDeactivated: false });
        setSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/helper/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });
            const data = await res.json();
            
            if (data.success) {
                const isDeactivated = data.message.includes('deactivated');
                setMessage({ 
                    type: isDeactivated ? 'warning' : 'success', 
                    text: data.message,
                    isDeactivated 
                });
                
                setProfile({
                    email: data.data.email,
                    mobile: data.data.mobile
                });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setMessage({ type: 'error', text: 'Something went wrong while saving.' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                            <User size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Edit Profile</h1>
                            <p className="text-slate-400 mt-1">Manage your Helper contact information</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/helper/dashboard')}
                        className="px-4 py-2 text-sm text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden"
                    >
                        {message.text && (
                            <div className={`p-5 rounded-xl mb-6 text-sm font-medium border ${
                                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                message.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-lg shadow-amber-500/5' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                <div className="flex items-start gap-3">
                                    {message.type === 'warning' && <Activity className="w-5 h-5 shrink-0 mt-0.5" />}
                                    <p className={message.type === 'warning' ? "text-base" : ""}>{message.text}</p>
                                </div>
                                {message.isDeactivated && (
                                    <button onClick={handleLogout} className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors">
                                        <LogOut size={16} /> Sign out for now
                                    </button>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-6 relative z-10">
                            
                            {/* Email ID Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Email Address (Login ID)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        disabled={message.isDeactivated}
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500/50 outline-none text-white text-sm transition-colors disabled:opacity-50"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <p className="text-xs text-amber-500/80 mt-2 font-medium">⚠️ Changing this will update your login ID and temporarily deactivate your account pending Admin approval.</p>
                            </div>

                            {/* Contact Number Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Contact Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        disabled={message.isDeactivated}
                                        value={profile.mobile}
                                        onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500/50 outline-none text-white text-sm transition-colors disabled:opacity-50"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={saving || message.isDeactivated}
                                className={`w-full py-4 mt-8 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 ${(saving || message.isDeactivated) && 'opacity-70 cursor-not-allowed'}`}
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HelperProfile;
