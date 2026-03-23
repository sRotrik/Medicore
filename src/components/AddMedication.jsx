import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useHealth } from '../context/HealthContext';

const AddMedication = () => {
    const navigate = useNavigate();
    const { refreshData } = useHealth();

    const [formData, setFormData] = useState({
        medicineName: '',
        hour: '08',
        minute: '00',
        period: 'AM', // 'AM' or 'PM'
        mealTiming: 'after', // 'before' or 'after'
        manufacturingDate: '',
        expiryDate: '',
        quantityPerIntake: '',
        remainingQuantity: '',
        selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] // All days by default
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

        // Clear error for this field
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
            ...prev,
            selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }));
    };

    const clearAllDays = () => {
        setFormData(prev => ({
            ...prev,
            selectedDays: []
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.medicineName.trim()) {
            newErrors.medicineName = 'Medicine name is required';
        }

        if (formData.selectedDays.length === 0) {
            newErrors.days = 'Please select at least one day';
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

    // Convert 12-hour format to 24-hour format
    const convertTo24Hour = (hour, minute, period) => {
        let hour24 = parseInt(hour);
        if (period === 'PM' && hour24 !== 12) {
            hour24 += 12;
        } else if (period === 'AM' && hour24 === 12) {
            hour24 = 0;
        }
        return `${hour24.toString().padStart(2, '0')}:${minute}`;
    };

    const isFormValid = () => {
        return formData.medicineName.trim() &&
            formData.hour &&
            formData.minute &&
            formData.manufacturingDate &&
            formData.expiryDate &&
            formData.quantityPerIntake > 0 &&
            formData.remainingQuantity > 0 &&
            new Date(formData.expiryDate) > new Date(formData.manufacturingDate);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsSubmitting(true);

            try {
                const token = localStorage.getItem('accessToken');

                // Convert time to 24-hour format
                const time24 = convertTo24Hour(formData.hour, formData.minute, formData.period);

                const response = await fetch('http://localhost:5000/api/patient/medications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...formData,
                        time: time24 // Send in 24-hour format
                    })
                });

                const data = await response.json();

                if (data.success) {
                    await refreshData(); // Refresh data from server
                    alert('Medication added successfully!');
                    navigate('/patient/medication');
                } else {
                    alert('Failed to add medication: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error adding medication:', error);
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
        <div className="min-h-screen bg-slate-950 ml-64 p-8">
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
                            <h1 className="text-4xl font-bold text-white mb-1">Add New Medication</h1>
                            <p className="text-slate-400">Fill in the details of your medication</p>
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

                            {/* Time Picker with AM/PM */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Clock size={16} />
                                    Time of Medicine *
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Hour */}
                                    <div>
                                        <select
                                            name="hour"
                                            value={formData.hour}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none"
                                        >
                                            {[...Array(12)].map((_, i) => {
                                                const hour = (i + 1).toString().padStart(2, '0');
                                                return <option key={hour} value={hour}>{hour}</option>;
                                            })}
                                        </select>
                                        <p className="text-xs text-slate-500 mt-1 text-center">Hour</p>
                                    </div>

                                    {/* Minute */}
                                    <div>
                                        <select
                                            name="minute"
                                            value={formData.minute}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none"
                                        >
                                            {[...Array(60)].map((_, i) => {
                                                const minute = i.toString().padStart(2, '0');
                                                return <option key={minute} value={minute}>{minute}</option>;
                                            })}
                                        </select>
                                        <p className="text-xs text-slate-500 mt-1 text-center">Minute</p>
                                    </div>

                                    {/* AM/PM */}
                                    <div>
                                        <select
                                            name="period"
                                            value={formData.period}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none"
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                        <p className="text-xs text-slate-500 mt-1 text-center">Period</p>
                                    </div>
                                </div>

                                {/* Time Preview */}
                                <div className="text-center">
                                    <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-semibold">
                                        {formData.hour}:{formData.minute} {formData.period}
                                    </span>
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

                        {/* Days Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Calendar size={16} />
                                Select Days to Take Medication *
                            </label>

                            {/* Quick Actions */}
                            <div className="flex gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={selectAllDays}
                                    className="px-3 py-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                                >
                                    Select All
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAllDays}
                                    className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Day Buttons */}
                            <div className="grid grid-cols-7 gap-2">
                                {days.map((day) => {
                                    const isSelected = formData.selectedDays.includes(day.short);
                                    return (
                                        <motion.button
                                            key={day.short}
                                            type="button"
                                            onClick={() => toggleDay(day.short)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`p-3 rounded-xl font-semibold text-sm transition-all ${isSelected
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                            title={day.full}
                                        >
                                            <div className="text-xs mb-1">{day.short}</div>
                                            <div className="text-[10px] opacity-70">{day.full.slice(0, 3)}</div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Selected Days Summary */}
                            <div className="text-xs text-slate-400 mt-2">
                                {formData.selectedDays.length === 7 ? (
                                    <span className="text-emerald-400">✓ Every day</span>
                                ) : formData.selectedDays.length === 0 ? (
                                    <span className="text-red-400">⚠ No days selected</span>
                                ) : (
                                    <span>
                                        Selected: {formData.selectedDays.join(', ')} ({formData.selectedDays.length} day{formData.selectedDays.length !== 1 ? 's' : ''})
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                            <div className="flex gap-3">
                                <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-300 mb-1">Important Information</h4>
                                    <p className="text-xs text-slate-400">
                                        Please ensure all medication details are accurate. Double-check the expiry date and dosage information before saving.
                                    </p>
                                </div>
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
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Save Medication
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

export default AddMedication;
