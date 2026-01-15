import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    AlertCircle,
    Save
} from 'lucide-react';

const AddAppointment = () => {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        purpose: '',
        doctorName: '',
        contactNumber: '',
        date: '',
        time: '',
        place: '',
        remarks: ''
    });

    // Validation errors
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle blur (field touched)
    const handleBlur = (field) => {
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
        validateField(field, formData[field]);
    };

    // Validate individual field
    const validateField = (field, value) => {
        let error = '';

        switch (field) {
            case 'purpose':
                if (!value.trim()) {
                    error = 'Purpose is required';
                } else if (value.trim().length < 3) {
                    error = 'Purpose must be at least 3 characters';
                }
                break;
            case 'doctorName':
                if (!value.trim()) {
                    error = 'Doctor name is required';
                } else if (value.trim().length < 3) {
                    error = 'Doctor name must be at least 3 characters';
                }
                break;
            case 'contactNumber':
                if (!value.trim()) {
                    error = 'Contact number is required';
                } else if (!/^[\d\s\-\+\(\)]+$/.test(value)) {
                    error = 'Invalid phone number format';
                } else if (value.replace(/\D/g, '').length < 10) {
                    error = 'Phone number must be at least 10 digits';
                }
                break;
            case 'date':
                if (!value) {
                    error = 'Date is required';
                } else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate < today) {
                        error = 'Date cannot be in the past';
                    }
                }
                break;
            case 'time':
                if (!value) {
                    error = 'Time is required';
                }
                break;
            case 'place':
                if (!value.trim()) {
                    error = 'Location is required';
                } else if (value.trim().length < 3) {
                    error = 'Location must be at least 3 characters';
                }
                break;
            case 'remarks':
                // Remarks is optional, no validation needed
                break;
            default:
                break;
        }

        setErrors(prev => ({
            ...prev,
            [field]: error
        }));

        return error === '';
    };

    // Validate all fields
    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        Object.keys(formData).forEach(field => {
            if (field !== 'remarks') { // Remarks is optional
                const valid = validateField(field, formData[field]);
                if (!valid) {
                    isValid = false;
                }
            }
        });

        return isValid;
    };

    // Check if form is valid
    const isFormValid = () => {
        return (
            formData.purpose.trim() &&
            formData.doctorName.trim() &&
            formData.contactNumber.trim() &&
            formData.date &&
            formData.time &&
            formData.place.trim() &&
            Object.values(errors).every(error => !error)
        );
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        // Validate form
        if (validateForm()) {
            // Show success animation
            setShowSuccess(true);

            // Simulate saving (in real app, this would be an API call)
            setTimeout(() => {
                // Navigate back to appointment list
                navigate('/patient/appointment');
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 ml-64 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Success Animation Overlay */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-3xl p-12 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                >
                                    <CheckCircle2 className="text-emerald-400 w-24 h-24 mx-auto mb-4" />
                                </motion.div>
                                <h2 className="text-3xl font-bold text-white mb-2">Appointment Scheduled!</h2>
                                <p className="text-slate-400">Redirecting to your appointments...</p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <motion.button
                        onClick={() => navigate('/patient/appointment')}
                        whileHover={{ x: -4 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Appointments
                    </motion.button>

                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <Calendar className="text-emerald-400" size={36} />
                        Schedule New Appointment
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Fill in the details below to book your appointment
                    </p>
                </motion.div>

                {/* Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-8"
                >
                    <div className="space-y-6">
                        {/* Purpose */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                                <FileText className="text-emerald-400" size={18} />
                                Appointment Purpose / Description
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleChange}
                                onBlur={() => handleBlur('purpose')}
                                placeholder="e.g., Regular checkup, Follow-up consultation"
                                className={`w-full px-4 py-3 bg-slate-800 border ${touched.purpose && errors.purpose
                                        ? 'border-red-500/50 focus:border-red-500'
                                        : 'border-slate-700 focus:border-emerald-500'
                                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${touched.purpose && errors.purpose
                                        ? 'focus:ring-red-500/20'
                                        : 'focus:ring-emerald-500/20'
                                    } transition-all`}
                            />
                            <AnimatePresence>
                                {touched.purpose && errors.purpose && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-red-400 text-sm mt-2 flex items-center gap-1"
                                    >
                                        <AlertCircle size={14} />
                                        {errors.purpose}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Doctor Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                                <User className="text-blue-400" size={18} />
                                Doctor Name
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="doctorName"
                                value={formData.doctorName}
                                onChange={handleChange}
                                onBlur={() => handleBlur('doctorName')}
                                placeholder="e.g., Dr. Sarah Johnson"
                                className={`w-full px-4 py-3 bg-slate-800 border ${touched.doctorName && errors.doctorName
                                        ? 'border-red-500/50 focus:border-red-500'
                                        : 'border-slate-700 focus:border-blue-500'
                                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${touched.doctorName && errors.doctorName
                                        ? 'focus:ring-red-500/20'
                                        : 'focus:ring-blue-500/20'
                                    } transition-all`}
                            />
                            <AnimatePresence>
                                {touched.doctorName && errors.doctorName && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-red-400 text-sm mt-2 flex items-center gap-1"
                                    >
                                        <AlertCircle size={14} />
                                        {errors.doctorName}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Contact Number */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                                <Phone className="text-purple-400" size={18} />
                                Doctor Contact Number
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                onBlur={() => handleBlur('contactNumber')}
                                placeholder="e.g., +1 (555) 123-4567"
                                className={`w-full px-4 py-3 bg-slate-800 border ${touched.contactNumber && errors.contactNumber
                                        ? 'border-red-500/50 focus:border-red-500'
                                        : 'border-slate-700 focus:border-purple-500'
                                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${touched.contactNumber && errors.contactNumber
                                        ? 'focus:ring-red-500/20'
                                        : 'focus:ring-purple-500/20'
                                    } transition-all`}
                            />
                            <AnimatePresence>
                                {touched.contactNumber && errors.contactNumber && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-red-400 text-sm mt-2 flex items-center gap-1"
                                    >
                                        <AlertCircle size={14} />
                                        {errors.contactNumber}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Date and Time Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                                    <Calendar className="text-teal-400" size={18} />
                                    Appointment Date
                                    <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('date')}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-4 py-3 bg-slate-800 border ${touched.date && errors.date
                                            ? 'border-red-500/50 focus:border-red-500'
                                            : 'border-slate-700 focus:border-teal-500'
                                        } rounded-xl text-white focus:outline-none focus:ring-2 ${touched.date && errors.date
                                            ? 'focus:ring-red-500/20'
                                            : 'focus:ring-teal-500/20'
                                        } transition-all`}
                                />
                                <AnimatePresence>
                                    {touched.date && errors.date && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-red-400 text-sm mt-2 flex items-center gap-1"
                                        >
                                            <AlertCircle size={14} />
                                            {errors.date}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Time */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                                    <Clock className="text-orange-400" size={18} />
                                    Appointment Time
                                    <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('time')}
                                    className={`w-full px-4 py-3 bg-slate-800 border ${touched.time && errors.time
                                            ? 'border-red-500/50 focus:border-red-500'
                                            : 'border-slate-700 focus:border-orange-500'
                                        } rounded-xl text-white focus:outline-none focus:ring-2 ${touched.time && errors.time
                                            ? 'focus:ring-red-500/20'
                                            : 'focus:ring-orange-500/20'
                                        } transition-all`}
                                />
                                <AnimatePresence>
                                    {touched.time && errors.time && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-red-400 text-sm mt-2 flex items-center gap-1"
                                        >
                                            <AlertCircle size={14} />
                                            {errors.time}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Place / Location */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                                <MapPin className="text-pink-400" size={18} />
                                Place / Location
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="place"
                                value={formData.place}
                                onChange={handleChange}
                                onBlur={() => handleBlur('place')}
                                placeholder="e.g., City Medical Center, Room 305 or Online Video Call"
                                className={`w-full px-4 py-3 bg-slate-800 border ${touched.place && errors.place
                                        ? 'border-red-500/50 focus:border-red-500'
                                        : 'border-slate-700 focus:border-pink-500'
                                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${touched.place && errors.place
                                        ? 'focus:ring-red-500/20'
                                        : 'focus:ring-pink-500/20'
                                    } transition-all`}
                            />
                            <AnimatePresence>
                                {touched.place && errors.place && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-red-400 text-sm mt-2 flex items-center gap-1"
                                    >
                                        <AlertCircle size={14} />
                                        {errors.place}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                                <Stethoscope className="text-cyan-400" size={18} />
                                Remarks for Appointment
                                <span className="text-slate-500 text-xs font-normal">(Optional)</span>
                            </label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                placeholder="e.g., Bring previous reports, fasting required, etc."
                                rows="4"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                            />
                        </div>

                        {/* Form Info */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-sm text-blue-300 font-medium mb-1">Important Information</p>
                                    <p className="text-sm text-blue-200">
                                        All fields marked with <span className="text-red-400">*</span> are mandatory.
                                        Please ensure all information is accurate before submitting.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <motion.button
                                type="button"
                                onClick={() => navigate('/patient/appointment')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-semibold border border-slate-700 hover:bg-slate-700 transition-all duration-200"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                type="submit"
                                disabled={!isFormValid()}
                                whileHover={isFormValid() ? { scale: 1.02, boxShadow: "0 10px 40px -10px rgba(16, 185, 129, 0.5)" } : {}}
                                whileTap={isFormValid() ? { scale: 0.98 } : {}}
                                className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isFormValid()
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                    }`}
                            >
                                <Save size={20} />
                                Schedule Appointment
                            </motion.button>
                        </div>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default AddAppointment;
