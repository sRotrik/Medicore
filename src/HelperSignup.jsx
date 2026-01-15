/**
 * Helper Signup Page
 * Allows helpers to create an account with verified identity details
 * Integrates with global state management for Patient-Helper system
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Upload,
    Check,
    ArrowRight,
    Activity,
    Phone,
    CreditCard,
    FileText,
    AlertCircle,
    Shield
} from 'lucide-react';

const HelperSignup = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [touched, setTouched] = useState({});

    // Helper Form State
    const [helperForm, setHelperForm] = useState({
        fullName: '',
        age: '',
        contactNumber: '',
        verificationId: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setHelperForm(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle input blur (for validation)
    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field, helperForm[field]);
    };

    // Validate individual field
    const validateField = (field, value) => {
        let error = '';

        switch (field) {
            case 'fullName':
                if (!value.trim()) {
                    error = 'Full name is required';
                } else if (value.trim().length < 3) {
                    error = 'Name must be at least 3 characters';
                }
                break;

            case 'age':
                if (!value) {
                    error = 'Age is required';
                } else if (value < 18) {
                    error = 'Helper must be at least 18 years old';
                } else if (value > 100) {
                    error = 'Please enter a valid age';
                }
                break;

            case 'contactNumber':
                if (!value.trim()) {
                    error = 'Contact number is required';
                } else if (!/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) {
                    error = 'Please enter a valid 10-digit number';
                }
                break;

            case 'verificationId':
                if (!value.trim()) {
                    error = 'Verification ID is required';
                } else if (value.trim().length < 6) {
                    error = 'Verification ID must be at least 6 characters';
                }
                break;

            default:
                break;
        }

        setErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    document: 'Only PDF, JPG, and PNG files are allowed'
                }));
                e.target.value = '';
                setUploadedFile(null);
            } else if (file.size > maxSize) {
                setErrors(prev => ({
                    ...prev,
                    document: 'File size must be less than 5MB'
                }));
                e.target.value = '';
                setUploadedFile(null);
            } else {
                setUploadedFile(file);
                setErrors(prev => ({ ...prev, document: '' }));
            }
        }
    };

    // Validate entire form
    const validateForm = () => {
        const newErrors = {};

        if (!helperForm.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (helperForm.fullName.trim().length < 3) {
            newErrors.fullName = 'Name must be at least 3 characters';
        }

        if (!helperForm.age) {
            newErrors.age = 'Age is required';
        } else if (helperForm.age < 18) {
            newErrors.age = 'Helper must be at least 18 years old';
        } else if (helperForm.age > 100) {
            newErrors.age = 'Please enter a valid age';
        }

        if (!helperForm.contactNumber.trim()) {
            newErrors.contactNumber = 'Contact number is required';
        } else if (!/^[0-9]{10}$/.test(helperForm.contactNumber.replace(/\D/g, ''))) {
            newErrors.contactNumber = 'Please enter a valid 10-digit number';
        }

        if (!helperForm.verificationId.trim()) {
            newErrors.verificationId = 'Verification ID is required';
        } else if (helperForm.verificationId.trim().length < 6) {
            newErrors.verificationId = 'Verification ID must be at least 6 characters';
        }

        if (!uploadedFile) {
            newErrors.document = 'Verification document is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Check if form is valid (for button state)
    const isFormValid = () => {
        return (
            helperForm.fullName.trim() &&
            helperForm.fullName.trim().length >= 3 &&
            helperForm.age &&
            helperForm.age >= 18 &&
            helperForm.age <= 100 &&
            helperForm.contactNumber.trim() &&
            /^[0-9]{10}$/.test(helperForm.contactNumber.replace(/\D/g, '')) &&
            helperForm.verificationId.trim() &&
            helperForm.verificationId.trim().length >= 6 &&
            uploadedFile &&
            Object.values(errors).every(error => !error)
        );
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({
            fullName: true,
            age: true,
            contactNumber: true,
            verificationId: true,
            document: true
        });

        if (validateForm()) {
            setIsLoading(true);

            // Simulate helper creation
            const helperData = {
                id: Date.now(), // Generate unique ID
                ...helperForm,
                documentName: uploadedFile.name,
                documentType: uploadedFile.type,
                createdAt: new Date().toISOString(),
                role: 'helper',
                verified: false // Would be verified by admin
            };

            console.log('Helper Signup Data:', helperData);

            // Simulate API call
            setTimeout(() => {
                setIsLoading(false);

                // Show success message
                alert('Helper account created successfully! Redirecting to Helper Portal...');

                // TODO: Add helper to global state here
                // const { addHelper } = useHealth();
                // addHelper(helperData);

                // Redirect to helper portal
                navigate('/helper/dashboard');
            }, 1500);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex bg-slate-950 font-sans text-slate-100 overflow-hidden">

            {/* Left Side - Form Section */}
            <div className="w-full lg:w-1/2 flex flex-col justify-start items-center p-8 sm:p-12 lg:p-16 relative z-10 overflow-y-auto">

                <div className="w-full max-w-md space-y-6">

                    {/* Brand / Logo Area */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Activity className="text-emerald-500 w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">MediCore</h1>
                            <p className="text-slate-500 text-sm">Helper Registration Portal</p>
                        </div>
                    </motion.div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-2">Become a Helper</h2>
                        <p className="text-slate-400">Join our trusted healthcare support network.</p>
                    </motion.div>

                    {/* Info Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3"
                    >
                        <Shield className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="text-sm font-semibold text-blue-300 mb-1">Verification Required</h3>
                            <p className="text-xs text-blue-200/80">
                                All helpers must provide valid identification for patient safety and trust.
                            </p>
                        </div>
                    </motion.div>

                    {/* Signup Form */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >

                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                                <User size={14} />
                                Helper Full Name *
                            </label>
                            <motion.input
                                whileFocus={{ scale: 1.01 }}
                                type="text"
                                name="fullName"
                                value={helperForm.fullName}
                                onChange={handleChange}
                                onBlur={() => handleBlur('fullName')}
                                className={`w-full px-4 py-3 bg-slate-900 border ${touched.fullName && errors.fullName
                                        ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500'
                                        : 'border-slate-800 focus:ring-emerald-500/20 focus:border-emerald-500'
                                    } rounded-xl focus:ring-2 text-white placeholder-slate-600 transition-all outline-none`}
                                placeholder="Enter your full name"
                            />
                            <AnimatePresence>
                                {touched.fullName && errors.fullName && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-xs text-red-400 flex items-center gap-1"
                                    >
                                        <AlertCircle size={12} />
                                        {errors.fullName}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Age */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                Age *
                            </label>
                            <motion.input
                                whileFocus={{ scale: 1.01 }}
                                type="number"
                                name="age"
                                value={helperForm.age}
                                onChange={handleChange}
                                onBlur={() => handleBlur('age')}
                                className={`w-full px-4 py-3 bg-slate-900 border ${touched.age && errors.age
                                        ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500'
                                        : 'border-slate-800 focus:ring-emerald-500/20 focus:border-emerald-500'
                                    } rounded-xl focus:ring-2 text-white placeholder-slate-600 transition-all outline-none`}
                                placeholder="Enter your age"
                                min="18"
                                max="100"
                            />
                            <AnimatePresence>
                                {touched.age && errors.age && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-xs text-red-400 flex items-center gap-1"
                                    >
                                        <AlertCircle size={12} />
                                        {errors.age}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Contact Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                                <Phone size={14} />
                                Contact Number *
                            </label>
                            <motion.input
                                whileFocus={{ scale: 1.01 }}
                                type="tel"
                                name="contactNumber"
                                value={helperForm.contactNumber}
                                onChange={handleChange}
                                onBlur={() => handleBlur('contactNumber')}
                                className={`w-full px-4 py-3 bg-slate-900 border ${touched.contactNumber && errors.contactNumber
                                        ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500'
                                        : 'border-slate-800 focus:ring-emerald-500/20 focus:border-emerald-500'
                                    } rounded-xl focus:ring-2 text-white placeholder-slate-600 transition-all outline-none`}
                                placeholder="10-digit mobile number"
                                maxLength="10"
                            />
                            <AnimatePresence>
                                {touched.contactNumber && errors.contactNumber && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-xs text-red-400 flex items-center gap-1"
                                    >
                                        <AlertCircle size={12} />
                                        {errors.contactNumber}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Verification ID */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                                <CreditCard size={14} />
                                Verification ID Number *
                            </label>
                            <motion.input
                                whileFocus={{ scale: 1.01 }}
                                type="text"
                                name="verificationId"
                                value={helperForm.verificationId}
                                onChange={handleChange}
                                onBlur={() => handleBlur('verificationId')}
                                className={`w-full px-4 py-3 bg-slate-900 border ${touched.verificationId && errors.verificationId
                                        ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500'
                                        : 'border-slate-800 focus:ring-emerald-500/20 focus:border-emerald-500'
                                    } rounded-xl focus:ring-2 text-white placeholder-slate-600 transition-all outline-none`}
                                placeholder="e.g., Aadhaar, Passport, Driver's License"
                            />
                            <AnimatePresence>
                                {touched.verificationId && errors.verificationId && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-xs text-red-400 flex items-center gap-1"
                                    >
                                        <AlertCircle size={12} />
                                        {errors.verificationId}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            <p className="text-xs text-slate-500">
                                Accepted: Aadhaar, Passport, Driver's License, or Government ID
                            </p>
                        </div>

                        {/* Document Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                                <FileText size={14} />
                                Profile Image / Verification Document *
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="document-upload"
                                />
                                <motion.label
                                    whileHover={{ scale: 1.01, borderColor: 'rgba(16, 185, 129, 0.5)' }}
                                    whileTap={{ scale: 0.99 }}
                                    htmlFor="document-upload"
                                    className={`flex items-center justify-center gap-2 w-full px-4 py-4 bg-slate-900 border ${uploadedFile
                                            ? 'border-emerald-500/50 bg-emerald-500/5'
                                            : errors.document
                                                ? 'border-red-500/50'
                                                : 'border-slate-800 border-dashed'
                                        } rounded-xl hover:border-emerald-500/50 cursor-pointer transition-all`}
                                >
                                    {uploadedFile ? (
                                        <>
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200 }}
                                            >
                                                <Check className="text-emerald-500" size={20} />
                                            </motion.div>
                                            <div className="flex-1 text-left">
                                                <p className="text-emerald-400 text-sm font-medium">{uploadedFile.name}</p>
                                                <p className="text-xs text-emerald-300/60">
                                                    {(uploadedFile.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="text-slate-500" size={20} />
                                            <div className="flex-1 text-left">
                                                <p className="text-slate-400 text-sm font-medium">Click to upload document</p>
                                                <p className="text-xs text-slate-500">PDF, JPG, PNG (Max 5MB)</p>
                                            </div>
                                        </>
                                    )}
                                </motion.label>
                            </div>
                            <AnimatePresence>
                                {errors.document && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-xs text-red-400 flex items-center gap-1"
                                    >
                                        <AlertCircle size={12} />
                                        {errors.document}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={isFormValid() ? { scale: 1.01, boxShadow: "0 10px 40px -10px rgba(16, 185, 129, 0.5)" } : {}}
                            whileTap={isFormValid() ? { scale: 0.99 } : {}}
                            type="submit"
                            disabled={isLoading || !isFormValid()}
                            className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${isLoading || !isFormValid()
                                    ? 'bg-slate-800 cursor-not-allowed text-slate-500'
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/50'
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Register as Helper <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>

                        {/* Info Note */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
                            <p className="text-xs text-slate-400 text-center">
                                By registering, you agree to our verification process and background check for patient safety.
                            </p>
                        </div>
                    </motion.form>

                    {/* Footer Link */}
                    <p className="text-center text-sm text-slate-500 pb-8">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>

            {/* Right Side - Image Section */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-emerald-900/20 mix-blend-overlay z-10" />

                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2670&auto=format&fit=crop"
                    alt="Healthcare Helper"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />

                <div className="absolute bottom-0 left-0 w-full p-16 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="max-w-xl"
                    >
                        <div className="mb-6 flex gap-2">
                            <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/20 text-emerald-300 text-xs font-semibold backdrop-blur-sm">
                                Verified Helpers
                            </div>
                            <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-sm">
                                Trusted Network
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Make a Difference in <span className="text-emerald-400">Healthcare.</span>
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed mb-6">
                            Join our network of trusted healthcare helpers and support patients in their journey to better health. Your care makes all the difference.
                        </p>

                        {/* Features List */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Check className="text-emerald-400" size={16} />
                                </div>
                                <p className="text-slate-300 text-sm">Background verification for trust</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Check className="text-emerald-400" size={16} />
                                </div>
                                <p className="text-slate-300 text-sm">Flexible scheduling options</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Check className="text-emerald-400" size={16} />
                                </div>
                                <p className="text-slate-300 text-sm">Secure patient-helper matching</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

        </div>
    );
};

export default HelperSignup;
