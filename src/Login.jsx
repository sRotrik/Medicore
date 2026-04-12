import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Users, ShieldCheck, Eye, EyeOff, ArrowRight, Activity, HeartPulse } from 'lucide-react';
import loginBg from './assets/login-bg.png';

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('patient'); // patient | helper | admin
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRoleChange = (newRole) => {
        setRole(newRole);
    };

    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) return;

        setIsLoading(true);
        setError('');

        try {
            // Call backend API for authentication
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.username,
                    password: formData.password,
                    role: role
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (!data.success) {
                throw new Error(data.message || 'Invalid credentials');
            }

            // Store tokens and role in localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.user.role); // ✅ CRITICAL FIX

            console.log('Login successful:', data.user);

            // Navigate based on role
            if (data.user.role === 'patient') {
                navigate('/patient/dashboard');
            } else if (data.user.role === 'helper') {
                navigate('/helper/dashboard');
            } else if (data.user.role === 'admin') {
                navigate('/admin/dashboard');
            }

        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = () => {
        navigate('/signup');
    };

    // Role configuration
    const roles = [
        { id: 'patient', label: 'Patient', icon: User, color: 'text-emerald-400', accent: 'border-emerald-500/50' },
        { id: 'helper', label: 'Helper', icon: Users, color: 'text-cyan-400', accent: 'border-cyan-500/50' },
        { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'text-indigo-400', accent: 'border-indigo-500/50' }
    ];

    const currentRoleConfig = roles.find(r => r.id === role);

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex bg-slate-950 font-sans text-slate-100 overflow-hidden">

            {/* Left Side - Form Section */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 relative z-10">

                <div className="w-full max-w-md space-y-8">

                    {/* Brand / Logo Area */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Activity className="text-emerald-500 w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">MediCore</h1>
                            <p className="text-slate-500 text-sm">Healthcare Access Portal</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
                        <p className="text-slate-400">Please enter your details to sign in.</p>
                    </div>

                    {/* Role Switcher - Professional Segmented Control */}
                    <div className="p-1 bg-slate-900/50 rounded-xl border border-slate-800 flex relative">
                        {roles.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRole(r.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors duration-300 ${role === r.id ? 'text-white' : 'text-slate-500 hover:text-slate-400'
                                    }`}
                            >
                                {/* <r.icon size={16} className={role === r.id ? r.color : ''} /> */}
                                {r.label}
                            </button>
                        ))}
                        <motion.div
                            className={`absolute top-1 bottom-1 rounded-lg bg-slate-800 shadow-sm border ${currentRoleConfig.accent}`}
                            layoutId="role-indicator"
                            initial={false}
                            animate={{
                                width: '33.33%',
                                x: roles.findIndex(r => r.id === role) * 100 + '%'
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            style={{ left: 0 }}
                        />
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Username or ID</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <currentRoleConfig.icon className={`h-5 w-5 ${currentRoleConfig.color} transition-colors duration-300`} />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                    placeholder={`Enter your ${role} ID`}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex justify-between">
                                Password
                                <span className="text-emerald-500 hover:text-emerald-400 text-xs cursor-pointer transition-colors">Forgot?</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading || !formData.username || !formData.password}
                            className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 flex items-center justify-center gap-2 ${isLoading || !formData.username || !formData.password
                                ? 'bg-slate-800 cursor-not-allowed text-slate-500'
                                : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/50'
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign in to account <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <p className="text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <button
                            onClick={handleSignUp}
                            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                            Register now
                        </button>
                    </p>
                </div>

                {/* Footer info */}
                <div className="absolute bottom-6 text-xs text-slate-700">
                    © 2026 MediCore Health Systems. All rights reserved.
                </div>
            </div>

            {/* Right Side - Image Section */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-emerald-900/20 mix-blend-overlay z-10" />

                {/* High-quality Medical Image */}
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    src={loginBg}
                    alt="Medical Professional"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />

                {/* Floating elements / Overlay Text */}
                <div className="absolute bottom-0 left-0 w-full p-16 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="max-w-xl"
                    >
                        <div className="mb-6 flex gap-2">
                            <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/20 text-emerald-300 text-xs font-semibold backdrop-blur-sm">
                                Trusted by 500+ Hospitals
                            </div>
                            <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-sm">
                                HIPAA Compliant
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Advanced Healthcare Management <span className="text-emerald-400">Simplified.</span>
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            Streamline patient care, manage appointments, and access secure medical records all in one unified platform designed for modern healthcare professionals.
                        </p>

                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden">
                                        <img src={`https://randomuser.me/api/portraits/thumb/men/${20 + i}.jpg`} className="w-full h-full object-cover opacity-80" alt="user" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-slate-400">
                                <span className="text-white font-bold">4.9/5</span> rating from medical staff
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

        </div>
    );
};

export default Login;
