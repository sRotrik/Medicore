import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Pill,
    Calendar,
    BarChart3,
    LogOut,
    Activity
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeItem, setActiveItem] = useState('dashboard');

    useEffect(() => {
        const path = location.pathname.split('/')[2] || 'dashboard';
        setActiveItem(path);
    }, [location]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
        { id: 'medication', label: 'Medication', icon: Pill, path: '/patient/medication' },
        { id: 'appointment', label: 'Appointment', icon: Calendar, path: '/patient/appointment' },
        { id: 'stats', label: 'Stats', icon: BarChart3, path: '/patient/stats' },
    ];

    const handleNavigation = (item) => {
        setActiveItem(item.id);
        navigate(item.path);
    };

    const handleLogout = () => {
        console.log('Logging out...');
        navigate('/login');
    };

    return (
        <div className="h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0">

            {/* Logo Section */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Activity className="text-emerald-500 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">MediCore</h1>
                        <p className="text-xs text-slate-500">Patient Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;

                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => handleNavigation(item)}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-slate-800">
                <motion.button
                    onClick={handleLogout}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:border hover:border-red-500/20 transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </motion.button>
            </div>
        </div>
    );
};

export default Sidebar;
