import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Users, Eye, EyeOff, Upload, Check, ArrowRight, Activity } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('patient'); // patient | helper
    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    // Patient Form State
    const [patientForm, setPatientForm] = useState({
        fullName: '',
        age: '',
        gender: '',
        contactNumber: '',
        whatsappNumber: '',
        sameAsContact: false,
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Helper Form State
    const [helperForm, setHelperForm] = useState({
        fullName: '',
        age: '',
        gender: '',
        contactNumber: '',
        whatsappNumber: '',
        sameAsContact: false,
        email: '',
        password: '',
        confirmPassword: '',
        verificationId: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setErrors({});
        setUploadedFile(null);
    };

    const handlePatientChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPatientForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'contactNumber' && prev.sameAsContact ? { whatsappNumber: value } : {})
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleHelperChange = (e) => {
        const { name, value, type, checked } = e.target;
        setHelperForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'contactNumber' && prev.sameAsContact ? { whatsappNumber: value } : {})
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (validTypes.includes(file.type)) {
                setUploadedFile(file);
                setErrors(prev => ({ ...prev, prescription: '' }));
            } else {
                setErrors(prev => ({ ...prev, prescription: 'Only PDF, JPG, and PNG files are allowed' }));
                e.target.value = '';
            }
        }
    };

    const validatePatientForm = () => {
        const newErrors = {};

        if (!patientForm.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!patientForm.age || patientForm.age < 1) newErrors.age = 'Valid age is required';
        if (!patientForm.gender) newErrors.gender = 'Gender is required';
        if (!patientForm.contactNumber || patientForm.contactNumber.length < 10) {
            newErrors.contactNumber = 'Valid contact number is required';
        }
        if (!patientForm.sameAsContact && !patientForm.whatsappNumber) {
            newErrors.whatsappNumber = 'WhatsApp number is required';
        }
        if (!patientForm.email || !/\S+@\S+\.\S+/.test(patientForm.email)) {
            newErrors.email = 'Valid email is required';
        }
        if (!uploadedFile) newErrors.prescription = 'Prescription upload is required';
        if (!patientForm.password || patientForm.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (patientForm.password !== patientForm.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateHelperForm = () => {
        const newErrors = {};

        if (!helperForm.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!helperForm.age || helperForm.age < 18) {
            newErrors.age = 'Helper must be at least 18 years old';
        }
        if (!helperForm.gender) newErrors.gender = 'Gender is required';
        if (!helperForm.contactNumber || helperForm.contactNumber.length < 10) {
            newErrors.contactNumber = 'Valid contact number is required';
        }
        if (!helperForm.sameAsContact && !helperForm.whatsappNumber) {
            newErrors.whatsappNumber = 'WhatsApp number is required';
        }
        if (!helperForm.email || !/\S+@\S+\.\S+/.test(helperForm.email)) {
            newErrors.email = 'Valid email is required';
        }
        if (!helperForm.password || helperForm.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (helperForm.password !== helperForm.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!helperForm.verificationId || helperForm.verificationId.length < 6) {
            newErrors.verificationId = 'Verification ID is required (min 6 characters)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = role === 'patient' ? validatePatientForm() : validateHelperForm();

        if (isValid) {
            setIsLoading(true);
            const formData = role === 'patient' ? patientForm : helperForm;
            const endpoint = role === 'patient' ? '/api/auth/register' : '/api/auth/register/helper';

            try {
                // Prepare payload
                const payload = {
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.fullName,
                    age: formData.age,
                    gender: formData.gender,
                    mobile: formData.contactNumber,
                    whatsapp: formData.sameAsContact ? formData.contactNumber : formData.whatsappNumber,
                    ...(role === 'helper' && { verification_id: formData.verificationId })
                };

                const response = await fetch(`http://localhost:5000${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                alert(data.message);

                if (role === 'patient') {
                    // Auto login or redirect to login
                    navigate('/login');
                } else {
                    // Helper is inactive, must go to login to see pending status or just redirect
                    navigate('/login');
                }

            } catch (error) {
                console.error('Registration Error:', error);
                setErrors(prev => ({
                    ...prev,
                    submit: error.message
                }));
                // Show error alert
                alert(error.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const isFormValid = () => {
        if (role === 'patient') {
            return patientForm.fullName && patientForm.age && patientForm.gender &&
                patientForm.contactNumber && patientForm.email && uploadedFile &&
                patientForm.password && patientForm.confirmPassword &&
                patientForm.password === patientForm.confirmPassword &&
                (patientForm.sameAsContact || patientForm.whatsappNumber);
        } else {
            return helperForm.fullName && helperForm.age && helperForm.gender &&
                helperForm.contactNumber && helperForm.verificationId &&
                helperForm.email && helperForm.password && helperForm.confirmPassword &&
                helperForm.password === helperForm.confirmPassword &&
                (helperForm.sameAsContact || helperForm.whatsappNumber);
        }
    };

    if (!mounted) return null;

    const roles = [
        { id: 'patient', label: 'Patient', icon: User },
        { id: 'helper', label: 'Helper', icon: Users }
    ];

    return (
        <div className="min-h-screen flex bg-slate-950 font-sans text-slate-100 overflow-hidden">

            {/* Left Side - Form Section */}
            <div className="w-full lg:w-1/2 flex flex-col justify-start items-center p-8 sm:p-12 lg:p-16 relative z-10 overflow-y-auto">

                <div className="w-full max-w-md space-y-6">

                    {/* Brand / Logo Area */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Activity className="text-emerald-500 w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">MediCore</h1>
                            <p className="text-slate-500 text-sm">Healthcare Access Portal</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-slate-400">Join our healthcare platform today.</p>
                    </div>

                    {/* Role Switcher */}
                    <div className="p-1 bg-slate-900/50 rounded-xl border border-slate-800 flex relative">
                        {roles.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => handleRoleChange(r.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors duration-300 ${role === r.id ? 'text-white' : 'text-slate-500 hover:text-slate-400'
                                    }`}
                            >
                                {r.label}
                            </button>
                        ))}
                        <motion.div
                            className="absolute top-1 bottom-1 rounded-lg bg-slate-800 shadow-sm border border-emerald-500/50"
                            layoutId="signup-role-indicator"
                            initial={false}
                            animate={{
                                width: '50%',
                                x: role === 'patient' ? '0%' : '100%'
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            style={{ left: 0 }}
                        />
                    </div>

                    {/* Signup Form */}
                    <motion.form
                        key={role}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >

                        {role === 'patient' ? (
                            <>
                                {/* Patient Form Fields */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={patientForm.fullName}
                                        onChange={handlePatientChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                        placeholder="Enter your full name"
                                    />
                                    {errors.fullName && <p className="text-xs text-red-400">{errors.fullName}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Age *</label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={patientForm.age}
                                            onChange={handlePatientChange}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                            placeholder="Age"
                                            min="1"
                                        />
                                        {errors.age && <p className="text-xs text-red-400">{errors.age}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Gender *</label>
                                        <select
                                            name="gender"
                                            value={patientForm.gender}
                                            onChange={handlePatientChange}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none"
                                        >
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.gender && <p className="text-xs text-red-400">{errors.gender}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Contact Number *</label>
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        value={patientForm.contactNumber}
                                        onChange={handlePatientChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                        placeholder="10-digit mobile number"
                                        maxLength="10"
                                    />
                                    {errors.contactNumber && <p className="text-xs text-red-400">{errors.contactNumber}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            name="sameAsContact"
                                            checked={patientForm.sameAsContact}
                                            onChange={handlePatientChange}
                                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
                                        />
                                        <label className="text-sm text-slate-400">WhatsApp number same as contact</label>
                                    </div>
                                    {!patientForm.sameAsContact && (
                                        <>
                                            <label className="text-sm font-medium text-slate-300">WhatsApp Number *</label>
                                            <input
                                                type="tel"
                                                name="whatsappNumber"
                                                value={patientForm.whatsappNumber}
                                                onChange={handlePatientChange}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                                placeholder="10-digit WhatsApp number"
                                                maxLength="10"
                                            />
                                            {errors.whatsappNumber && <p className="text-xs text-red-400">{errors.whatsappNumber}</p>}
                                        </>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={patientForm.email}
                                        onChange={handlePatientChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                        placeholder="your.email@example.com"
                                    />
                                    {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Helper Form Fields */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Helper Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={helperForm.fullName}
                                        onChange={handleHelperChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                        placeholder="Enter your full name"
                                    />
                                    {errors.fullName && <p className="text-xs text-red-400">{errors.fullName}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Age *</label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={helperForm.age}
                                            onChange={handleHelperChange}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                            placeholder="Age"
                                            min="18"
                                        />
                                        {errors.age && <p className="text-xs text-red-400">{errors.age}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Gender *</label>
                                        <select
                                            name="gender"
                                            value={helperForm.gender}
                                            onChange={handleHelperChange}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white transition-all outline-none"
                                        >
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.gender && <p className="text-xs text-red-400">{errors.gender}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Contact Number *</label>
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        value={helperForm.contactNumber}
                                        onChange={handleHelperChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                        placeholder="10-digit mobile number"
                                        maxLength="10"
                                    />
                                    {errors.contactNumber && <p className="text-xs text-red-400">{errors.contactNumber}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            name="sameAsContact"
                                            checked={helperForm.sameAsContact}
                                            onChange={handleHelperChange}
                                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
                                        />
                                        <label className="text-sm text-slate-400">WhatsApp number same as contact</label>
                                    </div>
                                    {!helperForm.sameAsContact && (
                                        <>
                                            <label className="text-sm font-medium text-slate-300">WhatsApp Number *</label>
                                            <input
                                                type="tel"
                                                name="whatsappNumber"
                                                value={helperForm.whatsappNumber}
                                                onChange={handleHelperChange}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                                placeholder="10-digit WhatsApp number"
                                                maxLength="10"
                                            />
                                            {errors.whatsappNumber && <p className="text-xs text-red-400">{errors.whatsappNumber}</p>}
                                        </>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={helperForm.email}
                                        onChange={handleHelperChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                        placeholder="your.email@example.com"
                                    />
                                    {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Verification ID Number *</label>
                                    <input
                                        type="text"
                                        name="verificationId"
                                        value={helperForm.verificationId}
                                        onChange={handleHelperChange}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                        placeholder="e.g., Aadhaar, Passport, Driver's License"
                                    />
                                    {errors.verificationId && <p className="text-xs text-red-400">{errors.verificationId}</p>}
                                    <p className="text-xs text-slate-500">Accepted: Aadhaar, Passport, Driver's License, or Government ID</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Set Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={helperForm.password}
                                            onChange={handleHelperChange}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                            placeholder="Minimum 8 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Confirm Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={helperForm.confirmPassword}
                                            onChange={handleHelperChange}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                            placeholder="Re-enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
                                </div>
                            </>
                        )}

                        {/* Common Fields for Both Roles */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                {role === 'patient' ? 'Upload Prescription *' : 'Profile Image (Optional)'}
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-900 border border-slate-800 border-dashed rounded-xl hover:border-emerald-500/50 cursor-pointer transition-all"
                                >
                                    {uploadedFile ? (
                                        <>
                                            <Check className="text-emerald-500" size={18} />
                                            <span className="text-emerald-400 text-sm">{uploadedFile.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="text-slate-500" size={18} />
                                            <span className="text-slate-500 text-sm">Click to upload (PDF, JPG, PNG)</span>
                                        </>
                                    )}
                                </label>
                            </div>
                            {errors.prescription && <p className="text-xs text-red-400">{errors.prescription}</p>}
                            {errors.profileImage && <p className="text-xs text-red-400">{errors.profileImage}</p>}
                        </div>

                        {/* Password fields only for patient */}
                        {role === 'patient' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Set Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={patientForm.password}
                                            onChange={handlePatientChange}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                            placeholder="Minimum 6 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Confirm Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={patientForm.confirmPassword}
                                            onChange={handlePatientChange}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                            placeholder="Re-enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
                                </div>
                            </>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading || !isFormValid()}
                            className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 flex items-center justify-center gap-2 ${isLoading || !isFormValid()
                                ? 'bg-slate-800 cursor-not-allowed text-slate-500'
                                : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/50'
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create Account <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </motion.form>

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
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2574&auto=format&fit=crop"
                    alt="Healthcare Professional"
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
                                Secure Registration
                            </div>
                            <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-sm">
                                GDPR Compliant
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Join the Future of <span className="text-emerald-400">Healthcare.</span>
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            Whether you're a patient seeking care or a healthcare professional, MediCore provides a seamless, secure platform for all your medical needs.
                        </p>
                    </motion.div>
                </div>
            </div>

        </div>
    );
};

export default Signup;
