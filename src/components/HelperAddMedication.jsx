import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Pill,
    Clock,
    Calendar,
    Package,
    Save,
    AlertCircle
} from 'lucide-react';

const HelperAddMedication = () => {
    const navigate = useNavigate();
    const { patientId } = useParams();

    const [formData, setFormData] = useState({
        medicineName: '',
        hour: '08',
        minute: '00',
        period: 'AM', 
        mealTiming: 'after',
        manufacturingDate: '',
        expiryDate: '',
        quantityPerIntake: '',
        remainingQuantity: '',
        selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
    });

    const days = [
        { short: 'Mon', full: 'Monday' },
        { short: 'Tue', full: 'Tuesday' },
        { short: 'Wed', full: 'Wednesday' },
        { short: 'Thu', full: 'Thursday' },
        { short: 'Fri', full: 'Friday' },
        { short: 'Sat', full: 'Saturday' },
        { short: 'Sun', full: 'Sunday' }
    ];

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleToggleMealTiming = () => {
        setFormData(prev => ({
            ...prev,
            mealTiming: prev.mealTiming === 'before' ? 'after' : 'before'
        }));
    };

    const toggleDay = (day) => {
        setFormData(prev => ({
            ...prev,
            selectedDays: prev.selectedDays.includes(day)
                ? prev.selectedDays.filter(d => d !== day)
                : [...prev.selectedDays, day]
        }));
    };

    const selectAllDays = () => {
        setFormData(prev => ({
            ...prev, selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }));
    };

    const clearAllDays = () => {
        setFormData(prev => ({ ...prev, selectedDays: [] }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.medicineName.trim()) newErrors.medicineName = 'Medicine name is required';
        if (formData.selectedDays.length === 0) newErrors.days = 'Please select at least one day';
        if (!formData.manufacturingDate) newErrors.manufacturingDate = 'Manufacturing date is required';
        if (!formData.expiryDate) {
            newErrors.expiryDate = 'Expiry date is required';
        } else if (new Date(formData.expiryDate) <= new Date(formData.manufacturingDate)) {
            newErrors.expiryDate = 'Expiry date must be after manufacturing date';
        }
        if (!formData.quantityPerIntake || formData.quantityPerIntake <= 0) newErrors.quantityPerIntake = 'Valid quantity per intake is required';
        if (!formData.remainingQuantity || formData.remainingQuantity <= 0) newErrors.remainingQuantity = 'Valid remaining quantity is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const convertTo24Hour = (hour, minute, period) => {
        let hour24 = parseInt(hour);
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        else if (period === 'AM' && hour24 === 12) hour24 = 0;
        return `${hour24.toString().padStart(2, '0')}:${minute}`;
    };

    const isFormValid = () => {
        return formData.medicineName.trim() &&
            formData.hour && formData.minute &&
            formData.manufacturingDate && formData.expiryDate &&
            formData.quantityPerIntake > 0 && formData.remainingQuantity > 0 &&
            new Date(formData.expiryDate) > new Date(formData.manufacturingDate);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsSubmitting(true);
            try {
                const token = localStorage.getItem('accessToken');
                const time24 = convertTo24Hour(formData.hour, formData.minute, formData.period);

                const response = await fetch(`http://localhost:5000/api/helper/patients/${patientId}/medications`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        medicineName: formData.medicineName,
                        time: time24,
                        mealTiming: formData.mealTiming,
                        manufacturingDate: formData.manufacturingDate,
                        expiryDate: formData.expiryDate,
                        quantityPerIntake: formData.quantityPerIntake,
                        remainingQuantity: formData.remainingQuantity,
                        selectedDays: formData.selectedDays
                    })
                });

                const data = await response.json();

                if (data.success) {
                    alert('Medication added successfully for the patient!');
                    navigate(`/helper/patient/${patientId}`);
                } else {
                    alert('Failed to add medication: ' + (data.error || data.message));
                }
            } catch (error) {
                console.error('Error adding patient medication:', error);
                alert('Server error. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => navigate(`/helper/patient/${patientId}`);

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-3xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Patient Details</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Pill className="text-emerald-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-1">Add Medication for Patient</h1>
                            <p className="text-slate-400">Fill in the details for their medication</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Pill size={16} /> Medicine Name *
                            </label>
                            <input
                                type="text" name="medicineName" value={formData.medicineName} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 outline-none"
                                placeholder="e.g., Aspirin, Metformin"
                            />
                            {errors.medicineName && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} />{errors.medicineName}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Clock size={16} /> Time of Medicine *</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <select name="hour" value={formData.hour} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white outline-none">
                                            {[...Array(12)].map((_, i) => { const h = (i + 1).toString().padStart(2, '0'); return <option key={h} value={h}>{h}</option>; })}
                                        </select>
                                    </div>
                                    <div>
                                        <select name="minute" value={formData.minute} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white outline-none">
                                            {[...Array(60)].map((_, i) => { const m = i.toString().padStart(2, '0'); return <option key={m} value={m}>{m}</option>; })}
                                        </select>
                                    </div>
                                    <div>
                                        <select name="period" value={formData.period} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white outline-none">
                                            <option value="AM">AM</option><option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Meal Timing *</label>
                                <div className="flex items-center gap-4 h-[50px]">
                                    <span className={`text-sm ${formData.mealTiming === 'before' ? 'text-emerald-400' : 'text-slate-500'}`}>Before</span>
                                    <motion.button type="button" onClick={handleToggleMealTiming} className={`relative w-16 h-8 rounded-full ${formData.mealTiming === 'after' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                        <motion.div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full" animate={{ x: formData.mealTiming === 'after' ? 32 : 0 }} />
                                    </motion.button>
                                    <span className={`text-sm ${formData.mealTiming === 'after' ? 'text-emerald-400' : 'text-slate-500'}`}>After</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Calendar size={16} /> Manufacturing Date *</label>
                                <input type="date" name="manufacturingDate" value={formData.manufacturingDate} onChange={handleInputChange} max={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Calendar size={16} /> Expiry Date *</label>
                                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} min={formData.manufacturingDate || new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Pill size={16} /> Qty per Intake *</label>
                                <input type="number" name="quantityPerIntake" value={formData.quantityPerIntake} onChange={handleInputChange} min="1" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Package size={16} /> Remaining Qty *</label>
                                <input type="number" name="remainingQuantity" value={formData.remainingQuantity} onChange={handleInputChange} min="1" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none" />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={handleBack} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-semibold">Cancel</button>
                            <button type="submit" disabled={!isFormValid() || isSubmitting} className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${isFormValid() && !isSubmitting ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                                {isSubmitting ? 'Saving...' : <><Save size={20} /> Save Medication</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default HelperAddMedication;
