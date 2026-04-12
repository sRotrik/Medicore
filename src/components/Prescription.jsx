import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, FileText, Calendar, User, Link as LinkIcon, Trash2, Edit } from 'lucide-react';

const Prescription = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [newPrescription, setNewPrescription] = useState({
        title: '',
        doctor_name: '',
        date: '',
        notes: '',
        image_url: ''
    });

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/patient/prescriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPrescriptions(data.data);
            }
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/patient/prescriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newPrescription)
            });
            const data = await res.json();
            if (data.success) {
                setPrescriptions([data.data, ...prescriptions]);
                setIsAddOpen(false);
                setNewPrescription({ title: '', doctor_name: '', date: '', notes: '', image_url: '' });
            }
        } catch (error) {
            console.error("Error adding prescription:", error);
        }
    };

    const filteredPrescriptions = prescriptions.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">My Prescriptions</h1>
                        <p className="text-slate-400 mt-2">Manage and securely store your medical prescriptions</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={20} />
                        Add Prescription
                    </motion.button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by title or doctor name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none text-slate-200 transition-all placeholder:text-slate-500"
                    />
                </div>

                {/* Prescriptions Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : filteredPrescriptions.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl">
                        <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-slate-300">No prescriptions found</h3>
                        <p className="text-slate-500 mt-2">Add your first prescription to keep it handy.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPrescriptions.map((pr) => (
                            <motion.div
                                key={pr.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                                        <FileText size={24} />
                                    </div>
                                    <div className="text-xs font-medium px-3 py-1 bg-slate-800 text-slate-400 rounded-full flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        {new Date(pr.date).toLocaleDateString('en-GB')}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-100 mb-1">{pr.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                                    <User size={14} className="text-slate-500" />
                                    <span>Dr. {pr.doctor_name}</span>
                                </div>
                                {pr.notes && (
                                    <p className="text-sm text-slate-500 mb-6 line-clamp-2 bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                                        {pr.notes}
                                    </p>
                                )}
                                {pr.image_url && (
                                    <a 
                                        href={pr.image_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 mt-auto transition-colors font-medium bg-emerald-500/10 px-4 py-2 rounded-lg w-fit"
                                    >
                                        <LinkIcon size={16} />
                                        View Document
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setIsAddOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <button 
                                onClick={() => setIsAddOpen(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">New Prescription</h2>
                                <p className="text-slate-400 text-sm">Save a record of your medical prescription.</p>
                            </div>

                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Title / Condition</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={newPrescription.title}
                                        onChange={e => setNewPrescription({...newPrescription, title: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500/50 outline-none text-white text-sm"
                                        placeholder="e.g. Skin Allergies, Routine Checkup"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Doctor Name</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={newPrescription.doctor_name}
                                            onChange={e => setNewPrescription({...newPrescription, doctor_name: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500/50 outline-none text-white text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Date Prescribed</label>
                                        <input 
                                            required
                                            type="date" 
                                            value={newPrescription.date}
                                            onChange={e => setNewPrescription({...newPrescription, date: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500/50 outline-none text-white text-sm [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Document URL (Optional)</label>
                                    <input 
                                        type="url" 
                                        value={newPrescription.image_url}
                                        onChange={e => setNewPrescription({...newPrescription, image_url: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500/50 outline-none text-white text-sm"
                                        placeholder="https://drive.google.com/... or any link"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Doctor's Notes / Medicines</label>
                                    <textarea 
                                        rows="3"
                                        value={newPrescription.notes}
                                        onChange={e => setNewPrescription({...newPrescription, notes: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500/50 outline-none text-white text-sm resize-none"
                                        placeholder="Add any extra instructions..."
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full py-3 mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                    Save Prescription
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Prescription;
