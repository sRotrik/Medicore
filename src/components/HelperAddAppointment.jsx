import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Phone,
    User,
    FileText,
    Stethoscope,
    CheckCircle2,
    Save
} from 'lucide-react';

const HelperAddAppointment = () => {
    const navigate = useNavigate();
    const { patientId } = useParams();
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        purpose: '',
        doctorName: '',
        contactNumber: '',
        date: '',
        time: '',
        place: '',
        remarks: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = () => {
        return (
            formData.purpose.trim() &&
            formData.doctorName.trim() &&
            formData.contactNumber.trim() &&
            formData.date &&
            formData.time &&
            formData.place.trim()
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isFormValid()) {
            try {
                const token = localStorage.getItem('accessToken');

                const response = await fetch(`http://localhost:5000/api/helper/patients/${patientId}/appointments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        doctorName: formData.doctorName,
                        specialization: '', 
                        date: formData.date,
                        time: formData.time,
                        place: formData.place,
                        notes: formData.purpose + (formData.remarks ? '\n\n' + formData.remarks : ''),
                        contactNumber: formData.contactNumber
                    })
                });

                const data = await response.json();

                if (data.success) {
                    setShowSuccess(true);
                    setTimeout(() => {
                        navigate(`/helper/patient/${patientId}`);
                    }, 2000);
                } else {
                    alert('Failed to schedule appointment: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error scheduling appointment:', error);
                alert('Server error. Please try again.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto">
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-3xl p-12 text-center">
                                <CheckCircle2 className="text-emerald-400 w-24 h-24 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">Appointment Scheduled!</h2>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <button onClick={() => navigate(`/helper/patient/${patientId}`)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                        <ArrowLeft size={20} />
                        Back to Patient Details
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <Calendar className="text-emerald-400" size={36} />
                        Schedule New Appointment
                    </h1>
                </motion.div>

                <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2"><FileText className="text-emerald-400" size={18} /> Purpose *</label>
                            <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" placeholder="e.g., Checkup" />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2"><User className="text-blue-400" size={18} /> Doctor Name *</label>
                            <input type="text" name="doctorName" value={formData.doctorName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2"><Phone className="text-purple-400" size={18} /> Contact Number *</label>
                            <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2"><Calendar className="text-teal-400" size={18} /> Date *</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2"><Clock className="text-orange-400" size={18} /> Time *</label>
                                <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2"><MapPin className="text-pink-400" size={18} /> Location *</label>
                            <input type="text" name="place" value={formData.place} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2"><Stethoscope className="text-cyan-400" size={18} /> Remarks (Optional)</label>
                            <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="2" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none resize-none" />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => navigate(`/helper/patient/${patientId}`)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-semibold border border-slate-700">Cancel</button>
                            <button type="submit" disabled={!isFormValid()} className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${isFormValid() ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                                <Save size={20} /> Schedule Appointment
                            </button>
                        </div>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default HelperAddAppointment;
