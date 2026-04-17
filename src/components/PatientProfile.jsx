import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Save, Activity } from 'lucide-react';

const PatientProfile = () => {
    const [profile, setProfile] = useState({
        email: '',
        mobile: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/patient/profile', {
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
        setMessage({ type: '', text: '' });
        setSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/patient/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });
            const data = await res.json();
            
            if (data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                
                // Keep the state in sync
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

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                        <User size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Edit Profile</h1>
                        <p className="text-slate-400 mt-1">Manage your contact information</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl"
                    >
                        {message.text && (
                            <div className={`p-4 rounded-xl mb-6 text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-6">
                            
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
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500/50 outline-none text-white text-sm transition-colors"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Changing this will update the email you use to log in to MediCore.</p>
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
                                        value={profile.mobile}
                                        onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500/50 outline-none text-white text-sm transition-colors"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={saving}
                                className={`w-full py-4 mt-8 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 ${saving && 'opacity-70 cursor-not-allowed'}`}
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

export default PatientProfile;
