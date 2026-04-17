import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Pill,
    Clock,
    Calendar,
    Package,
    Save,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

const EditMedication = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { medications, refreshData } = useHealth();

    const [formData, setFormData] = useState({
        medicineName: '',
        times: [],
        mealTiming: 'after', // 'before' or 'after'
        manufacturingDate: '',
        expiryDate: '',
        quantityPerIntake: '',
        remainingQuantity: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch medication details
    useEffect(() => {
        // Find medication in global state
        // Note: id from params is string, med.id could be string or number
        const med = medications.find(m => String(m.id) === String(id) || String(m._id) === String(id));

        if (med) {
            let parsedTimes = [];
            let timeSrc = med.allScheduledTimes || med.time || med.frequency || '';
            if (Array.isArray(timeSrc)) {
                parsedTimes = timeSrc;
            } else if (typeof timeSrc === 'string') {
                parsedTimes = timeSrc.split(',').map(s => s.trim()).filter(Boolean);
            }
            if (parsedTimes.length === 0) parsedTimes = ['08:00'];

            const timesMapped = parsedTimes.map(tStr => {
                let hour = '08', minute = '00', period = 'AM';
                const match = tStr.match(/^(\d{1,2}):(\d{2})$/);
                if (match) {
                    let h = parseInt(match[1]);
                    minute = match[2];
                    if (h >= 12) {
                        period = 'PM';
                        if (h > 12) h -= 12;
                    } else {
                        period = 'AM';
                        if (h === 0) h = 12;
                    }
                    hour = String(h).padStart(2, '0');
                }
                return { hour, minute, period };
            });

            setFormData({
                medicineName: med.name || '',
                times: timesMapped,
                mealTiming: med.mealTiming === 'Before Meal' ? 'before' : 'after',
                manufacturingDate: med.manufacturingDate || '',
                expiryDate: med.expiryDate || '',
                quantityPerIntake: med.qtyPerDose || med.dosage || '',
                remainingQuantity: med.remainingQty || med.stock || ''
            });
        }
    }, [id, medications]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleTimeChange = (index, field, value) => {
        setFormData(prev => {
            const newTimes = [...prev.times];
            newTimes[index] = { ...newTimes[index], [field]: value };
            return { ...prev, times: newTimes };
        });
    };

    const addTime = () => {
        setFormData(prev => ({
            ...prev,
            times: [...prev.times, { hour: '12', minute: '00', period: 'PM' }]
        }));
    };

    const removeTime = (index) => {
        setFormData(prev => ({
            ...prev,
            times: prev.times.filter((_, i) => i !== index)
        }));
    };

    const handleToggleMealTiming = () => {
        setFormData(prev => ({
            ...prev,
            mealTiming: prev.mealTiming === 'before' ? 'after' : 'before'
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.medicineName.trim()) {
            newErrors.medicineName = 'Medicine name is required';
        }

        if (!formData.times || formData.times.length === 0) {
            newErrors.time = 'At least one time is required';
        }

        if (!formData.manufacturingDate) {
            newErrors.manufacturingDate = 'Manufacturing date is required';
        }

        if (!formData.expiryDate) {
            newErrors.expiryDate = 'Expiry date is required';
        } else if (new Date(formData.expiryDate) <= new Date(formData.manufacturingDate)) {
            newErrors.expiryDate = 'Expiry date must be after manufacturing date';
        }

        if (!formData.quantityPerIntake || formData.quantityPerIntake <= 0) {
            newErrors.quantityPerIntake = 'Valid quantity per intake is required';
        }

        if (!formData.remainingQuantity || formData.remainingQuantity <= 0) {
            newErrors.remainingQuantity = 'Valid remaining quantity is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isFormValid = () => {
        const hasValidTimes = formData.times.length > 0 && formData.times.every(t => t.hour && t.minute);
        return formData.medicineName.trim() &&
            hasValidTimes &&
            formData.manufacturingDate &&
            formData.expiryDate &&
            formData.quantityPerIntake > 0 &&
            formData.remainingQuantity > 0 &&
            new Date(formData.expiryDate) > new Date(formData.manufacturingDate);
    };

    const convertTo24Hour = (hour, minute, period) => {
        let hour24 = parseInt(hour);
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        else if (period === 'AM' && hour24 === 12) hour24 = 0;
        return `${hour24.toString().padStart(2, '0')}:${minute}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsSubmitting(true);

            try {
                const token = localStorage.getItem('accessToken');
                const timesArray = formData.times.map(t => convertTo24Hour(t.hour, t.minute, t.period));

                const response = await fetch(`http://localhost:5000/api/patient/medications/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        medicineName: formData.medicineName,
                        time: timesArray,
                        mealTiming: formData.mealTiming,
                        manufacturingDate: formData.manufacturingDate,
                        expiryDate: formData.expiryDate,
                        quantityPerIntake: formData.quantityPerIntake,
                        remainingQuantity: formData.remainingQuantity
                    })
                });

                const data = await response.json();

                if (data.success) {
                    await refreshData();
                    alert('Medication updated successfully!');
                    navigate('/patient/medication');
                } else {
                    alert('Failed to update medication: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error updating medication:', error);
                alert('Server error. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        navigate('/patient/medication');
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Medications</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Pill className="text-emerald-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-1">Edit Medication</h1>
                            <p className="text-slate-400">Update the details of your medication</p>
                        </div>
                    </div>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Medicine Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Pill size={16} />
                                Medicine Name *
                            </label>
                            <input
                                type="text"
                                name="medicineName"
                                value={formData.medicineName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                placeholder="e.g., Aspirin, Metformin"
                            />
                            {errors.medicineName && (
                                <p className="text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    {errors.medicineName}
                                </p>
                            )}
                        </div>

                        {/* Time and Meal Timing Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Dynamic Time Pickers */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Clock size={16} /> Time(s) of Medicine *
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={addTime}
                                        className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition-colors"
                                    >
                                        + Add Time
                                    </button>
                                </label>
                                
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {formData.times.map((timeObj, index) => (
                                        <div key={index} className="p-3 bg-slate-950 border border-slate-800 rounded-xl relative">
                                            {formData.times.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeTime(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500/20 text-red-500 rounded-full p-1 border border-red-500/30 hover:bg-red-500/40 transition-colors"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}
                                            <div className="grid grid-cols-3 gap-3">
                                                {/* Hour */}
                                                <div>
                                                    <select
                                                        value={timeObj.hour}
                                                        onChange={(e) => handleTimeChange(index, 'hour', e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none text-sm"
                                                    >
                                                        {[...Array(12)].map((_, i) => {
                                                            const hour = (i + 1).toString().padStart(2, '0');
                                                            return <option key={hour} value={hour}>{hour}</option>;
                                                        })}
                                                    </select>
                                                    <p className="text-[10px] text-slate-500 mt-1 text-center">Hour</p>
                                                </div>

                                                {/* Minute */}
                                                <div>
                                                    <select
                                                        value={timeObj.minute}
                                                        onChange={(e) => handleTimeChange(index, 'minute', e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none text-sm"
                                                    >
                                                        {[...Array(60)].map((_, i) => {
                                                            const minute = i.toString().padStart(2, '0');
                                                            return <option key={minute} value={minute}>{minute}</option>;
                                                        })}
                                                    </select>
                                                    <p className="text-[10px] text-slate-500 mt-1 text-center">Minute</p>
                                                </div>

                                                {/* AM/PM */}
                                                <div>
                                                    <select
                                                        value={timeObj.period}
                                                        onChange={(e) => handleTimeChange(index, 'period', e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none text-sm"
                                                    >
                                                        <option value="AM">AM</option>
                                                        <option value="PM">PM</option>
                                                    </select>
                                                    <p className="text-[10px] text-slate-500 mt-1 text-center">Period</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {errors.time && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.time}
                                    </p>
                                )}
                            </div>

                            {/* Meal Timing Toggle */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">
                                    Meal Timing *
                                </label>
                                <div className="flex items-center gap-4 h-[50px]">
                                    <span className={`text-sm font-medium transition-colors ${formData.mealTiming === 'before' ? 'text-emerald-400' : 'text-slate-500'
                                        }`}>
                                        Before Meal
                                    </span>

                                    {/* Toggle Switch */}
                                    <motion.button
                                        type="button"
                                        onClick={handleToggleMealTiming}
                                        className={`relative w-16 h-8 rounded-full transition-colors ${formData.mealTiming === 'after' ? 'bg-emerald-500' : 'bg-blue-500'
                                            }`}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <motion.div
                                            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
                                            animate={{
                                                x: formData.mealTiming === 'after' ? 32 : 0
                                            }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    </motion.button>

                                    <span className={`text-sm font-medium transition-colors ${formData.mealTiming === 'after' ? 'text-emerald-400' : 'text-slate-500'
                                        }`}>
                                        After Meal
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Manufacturing and Expiry Date Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Manufacturing Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Calendar size={16} />
                                    Manufacturing Date *
                                </label>
                                <input
                                    type="date"
                                    name="manufacturingDate"
                                    value={formData.manufacturingDate}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none"
                                />
                                {errors.manufacturingDate && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.manufacturingDate}
                                    </p>
                                )}
                            </div>

                            {/* Expiry Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Calendar size={16} />
                                    Expiry Date *
                                </label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    min={formData.manufacturingDate || new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none"
                                />
                                {errors.expiryDate && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.expiryDate}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quantity Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Quantity per Intake */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Pill size={16} />
                                    Quantity per Intake *
                                </label>
                                <input
                                    type="number"
                                    name="quantityPerIntake"
                                    value={formData.quantityPerIntake}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                    placeholder="e.g., 1, 2"
                                />
                                {errors.quantityPerIntake && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.quantityPerIntake}
                                    </p>
                                )}
                            </div>

                            {/* Remaining Quantity */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Package size={16} />
                                    Remaining Medicine Quantity *
                                </label>
                                <input
                                    type="number"
                                    name="remainingQuantity"
                                    value={formData.remainingQuantity}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                    placeholder="e.g., 30, 60"
                                />
                                {errors.remainingQuantity && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.remainingQuantity}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <motion.button
                                type="button"
                                onClick={handleBack}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                            >
                                Cancel
                            </motion.button>

                            <motion.button
                                type="submit"
                                disabled={!isFormValid() || isSubmitting}
                                whileHover={isFormValid() && !isSubmitting ? { scale: 1.02, boxShadow: "0 0 20px -5px rgba(16, 185, 129, 0.5)" } : {}}
                                whileTap={isFormValid() && !isSubmitting ? { scale: 0.98 } : {}}
                                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isFormValid() && !isSubmitting
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Update Medication
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default EditMedication;
