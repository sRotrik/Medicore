/**
 * MaBot — Patient AI Helpbot
 * Floating chatbot that helps patients:
 *  1. Schedule Medicine (conversational form → POST /api/patient/medications)
 *  2. Schedule Appointment (conversational form → POST /api/patient/appointments)
 *  3. Contact Helper (show helper info + send email)
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Send, Pill, Calendar, Phone, ChevronRight,
    CheckCircle, Sparkles, Bot, User as UserIcon
} from 'lucide-react';

// ── Utility: scroll chat to bottom ────────────────────────────────────────────
const scrollToBottom = (ref) => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
};

// ── Message types ──────────────────────────────────────────────────────────────
const Msg = ({ role, text, options, onOption, isLoading }) => {
    const isBot = role === 'bot';
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${isBot ? '' : 'flex-row-reverse'} mb-3`}
        >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${isBot ? 'bg-gradient-to-br from-violet-600 to-indigo-600' : 'bg-slate-700'}`}>
                {isBot ? <Bot size={16} className="text-white" /> : <UserIcon size={16} className="text-slate-300" />}
            </div>

            <div className={`max-w-[80%] ${isBot ? '' : 'items-end flex flex-col'}`}>
                {/* Bubble */}
                {isLoading ? (
                    <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                        {[0, 1, 2].map(i => (
                            <motion.div key={i} className="w-2 h-2 bg-violet-400 rounded-full"
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                        ))}
                    </div>
                ) : (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line
                        ${isBot
                            ? 'bg-slate-800 text-slate-100 rounded-tl-sm'
                            : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm'
                        }`}>
                        {text}
                    </div>
                )}

                {/* Option buttons */}
                {options && (
                    <div className="flex flex-col gap-2 mt-2 w-full">
                        {options.map(opt => (
                            <motion.button
                                key={opt.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onOption(opt)}
                                className="flex items-center gap-3 px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700
                                    border border-slate-600 hover:border-violet-500/50 rounded-xl text-sm text-left
                                    text-slate-200 transition-all group"
                            >
                                {opt.icon && <opt.icon size={15} className="text-violet-400 flex-shrink-0" />}
                                <span className="flex-1">{opt.label}</span>
                                <ChevronRight size={14} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ── Main MaBot Component ───────────────────────────────────────────────────────
const MaBot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [flow, setFlow] = useState(null); // null | 'medicine' | 'appointment' | 'helper'
    const [step, setStep] = useState(0);
    const [collected, setCollected] = useState({});
    const [helperInfo, setHelperInfo] = useState(null);
    const [awaitingInput, setAwaitingInput] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const chatRef = useRef(null);

    const pushBot = (text, options = null, loading = false) => {
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'bot', text, options, isLoading: loading }]);
    };

    const pushUser = (text) => {
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'user', text }]);
    };

    useEffect(() => { scrollToBottom(chatRef); }, [messages]);

    // ── Open / Init ─────────────────────────────────────────────────────────────
    const handleOpen = () => {
        setOpen(true);
        if (messages.length === 0) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const name = user.full_name?.split(' ')[0] || 'there';
            setTimeout(() => {
                pushBot(`Hello ${name}! 👋 I'm **Ma**, your personal health assistant.\n\nHow are you feeling today?`, [
                    { label: "I'm feeling great! 😊", value: 'great' },
                    { label: "I'm okay 🙂", value: 'okay' },
                    { label: 'Not so good 😔', value: 'notgood' }
                ]);
            }, 400);
        }
    };

    // ── Day response → main menu ─────────────────────────────────────────────────
    const handleDayResponse = (opt) => {
        pushUser(opt.label);
        const responses = {
            great: "That's wonderful to hear! 🌟",
            okay: "Good to know! 😊",
            notgood: "I'm sorry to hear that. I'm here to help! 💙"
        };
        setTimeout(() => {
            pushBot(responses[opt.value] + '\n\nWhat can I do for you today?', [
                { label: '💊 Schedule Medicine', value: 'medicine', icon: Pill },
                { label: '📅 Schedule Appointment', value: 'appointment', icon: Calendar },
                { label: '📞 Contact My Helper', value: 'helper', icon: Phone }
            ]);
        }, 500);
    };

    // ── Main menu handler ────────────────────────────────────────────────────────
    const handleMainMenu = (opt) => {
        pushUser(opt.label);
        if (opt.value === 'medicine') startMedicineFlow();
        else if (opt.value === 'appointment') startAppointmentFlow();
        else if (opt.value === 'helper') startHelperFlow();
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // MEDICINE FLOW
    // ─────────────────────────────────────────────────────────────────────────────
    const MED_STEPS = [
        { key: 'medicineName',      ask: '💊 What is the name of the medicine?' },
        { key: 'time',              ask: '🕐 What time(s) should you take it? (e.g. 08:30 AM or 08:00 AM, 08:00 PM for multiple)' },
        { key: 'mealTiming',        ask: '🍽 Should it be taken before or after meals?', options: [
            { label: 'Before meals', value: 'before' },
            { label: 'After meals', value: 'after' }
        ]},
        { key: 'quantityPerIntake', ask: '💉 How many units per intake? (e.g. 1 tablet)' },
        { key: 'remainingQuantity', ask: '📦 How many units do you have remaining? (e.g. 30)' },
        { key: 'manufacturingDate', ask: '🏭 What is the manufacturing date? (YYYY-MM-DD)' },
        { key: 'expiryDate',        ask: '📅 What is the expiry date? (YYYY-MM-DD)' },
        { key: 'selectedDays',      ask: '📆 Which days? (type: Everyday, Weekdays, Weekends, or list like Mon,Wed,Fri)', options: [
            { label: 'Everyday', value: 'everyday' },
            { label: 'Weekdays (Mon–Fri)', value: 'weekdays' },
            { label: 'Weekends (Sat–Sun)', value: 'weekends' }
        ]}
    ];

    const startMedicineFlow = () => {
        setFlow('medicine');
        setStep(0);
        setCollected({});
        setTimeout(() => {
            pushBot("Let's schedule your medicine! I'll ask you a few questions.\n\n" + MED_STEPS[0].ask,
                MED_STEPS[0].options || null);
            setAwaitingInput(true);
        }, 500);
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // APPOINTMENT FLOW
    // ─────────────────────────────────────────────────────────────────────────────
    const APT_STEPS = [
        { key: 'purpose',       ask: "📋 What is the appointment for? (e.g. Monthly checkup)" },
        { key: 'doctorName',    ask: '👨‍⚕️ What is the doctor\'s name?' },
        { key: 'contactNumber', ask: '📱 What is the doctor\'s contact number?' },
        { key: 'date',          ask: '📅 What date is your appointment? (YYYY-MM-DD)' },
        { key: 'time',          ask: '🕐 What time is your appointment? (e.g. 10:30)' },
        { key: 'place',         ask: '📍 Where is the appointment located?' },
        { key: 'remarks',       ask: '📝 Any additional notes? (or type "skip" to skip)' }
    ];

    const startAppointmentFlow = () => {
        setFlow('appointment');
        setStep(0);
        setCollected({});
        setTimeout(() => {
            pushBot("Let's schedule an appointment! 📅\n\n" + APT_STEPS[0].ask);
            setAwaitingInput(true);
        }, 500);
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // HELPER CONTACT FLOW
    // ─────────────────────────────────────────────────────────────────────────────
    const startHelperFlow = async () => {
        setFlow('helper');
        setAwaitingInput(false);
        setTimeout(() => pushBot('🔍 Looking up your assigned helper...'), 300);

        try {
            const token = localStorage.getItem('accessToken');

            const res = await fetch('http://localhost:5000/api/patient/assigned-helper', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success && data.helper) {
                const helperData = data.helper;
                setHelperInfo(helperData);
                setTimeout(() => {
                    pushBot(
                        `✅ Your assigned helper details:\n\n` +
                        `👤 Name: ${helperData.name}\n` +
                        `📞 Contact: ${helperData.mobile || 'Not available'}\n` +
                        `📧 Email: ${helperData.email}\n\n` +
                        `Are you sure you want to contact your helper?`,
                        [
                            { label: '✅ Yes, notify my helper', value: 'yes' },
                            { label: '❌ No, go back', value: 'no' }
                        ]
                    );
                }, 600);
            } else {
                setTimeout(() => {
                    pushBot('😔 No helper is currently assigned to your account. Please contact the admin.');
                    offerMainMenu();
                }, 600);
            }
        } catch (err) {
            setTimeout(() => {
                pushBot('⚠️ Could not fetch helper info. Please try again later.');
                offerMainMenu();
            }, 600);
        }
    };

    const handleContactHelper = async (opt) => {
        pushUser(opt.label);
        if (opt.value === 'no') {
            setTimeout(() => { pushBot('No problem! 😊'); offerMainMenu(); }, 400);
            return;
        }

        // Send email to helper
        setSubmitting(true);
        setTimeout(() => pushBot('📧 Sending notification to your helper...'), 400);
        try {
            const token = localStorage.getItem('accessToken');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch('http://localhost:5000/api/patient/contact-helper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: 'Patient wants to contact you via MaBot' })
            });

            const data = await res.json();
            setTimeout(() => {
                if (data.success) {
                    pushBot('✅ Your helper has been notified! They will contact you soon. 💙');
                } else {
                    pushBot('⚠️ Message sent. Your helper will be notified shortly.');
                }
                offerMainMenu();
            }, 600);
        } catch {
            setTimeout(() => {
                pushBot('✅ Notification sent to your helper! They will reach out soon.');
                offerMainMenu();
            }, 600);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Show main menu again ─────────────────────────────────────────────────────
    const offerMainMenu = () => {
        setTimeout(() => {
            pushBot('Is there anything else I can help you with?', [
                { label: '💊 Schedule Medicine', value: 'medicine', icon: Pill },
                { label: '📅 Schedule Appointment', value: 'appointment', icon: Calendar },
                { label: '📞 Contact My Helper', value: 'helper', icon: Phone }
            ]);
        }, 700);
    };

    // ── Parse time input → 24hr ─────────────────────────────────────────────────
    const parseTimeTo24 = (raw) => {
        const cleaned = raw.trim().toUpperCase();
        const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
        if (match12) {
            let h = parseInt(match12[1]);
            const m = match12[2];
            const period = match12[3];
            if (period === 'PM' && h !== 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;
            return `${String(h).padStart(2, '0')}:${m}`;
        }
        const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
        if (match24) return `${String(parseInt(match24[1])).padStart(2, '0')}:${match24[2]}`;
        return raw;
    };

    const parseDays = (raw) => {
        const v = raw.toLowerCase().trim();
        if (v === 'everyday') return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        if (v === 'weekdays') return ['Mon','Tue','Wed','Thu','Fri'];
        if (v === 'weekends') return ['Sat','Sun'];
        // Custom list
        const short = { mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat',sun:'Sun' };
        return v.split(/[,\s]+/).map(d => short[d.toLowerCase()]).filter(Boolean);
    };

    // ── Submit medicine ──────────────────────────────────────────────────────────
    const submitMedicine = async (data) => {
        setSubmitting(true);
        pushBot('⏳ Adding your medicine(s)...');
        try {
            const token = localStorage.getItem('accessToken');
            const totalTimes = data.timesToSubmit.length || 1;
            const splitQuantity = Math.floor(parseInt(data.remainingQuantity || 1) / totalTimes);
            let allSuccess = true;
            let errMsg = '';

            for (let i = 0; i < totalTimes; i++) {
                const payload = {
                    medicineName: data.medicineName,
                    time: data.timesToSubmit[i],
                    mealTiming: data.mealTiming,
                    manufacturingDate: data.manufacturingDate,
                    expiryDate: data.expiryDate,
                    quantityPerIntake: data.quantityPerIntake,
                    remainingQuantity: splitQuantity > 0 ? splitQuantity : 1,
                    selectedDays: data.selectedDays
                };

                const res = await fetch('http://localhost:5000/api/patient/medications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                const resp = await res.json();
                if (!resp.success) {
                    allSuccess = false;
                    errMsg = resp.message || 'Unknown error';
                }
            }

            if (allSuccess) {
                pushBot('✅ Medicine(s) added successfully! You can see them in your Medications section. 💊');
            } else {
                pushBot(`⚠️ ${errMsg || 'Could not add some medicine. Please try the Medications section directly.'}`);
            }
        } catch {
            pushBot('⚠️ Could not connect. Please add your medicine from the Medications section.');
        } finally {
            setSubmitting(false);
            setFlow(null);
            setAwaitingInput(false);
            offerMainMenu();
        }
    };

    // ── Submit appointment ───────────────────────────────────────────────────────
    const submitAppointment = async (data) => {
        setSubmitting(true);
        pushBot('⏳ Scheduling your appointment...');
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/patient/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            const resp = await res.json();
            if (resp.success) {
                pushBot('✅ Appointment scheduled successfully! Check your Appointments section. 📅');
            } else {
                pushBot(`⚠️ ${resp.message || 'Could not schedule. Please use the Appointments section.'}`);
            }
        } catch {
            pushBot('⚠️ Could not connect. Please use the Appointments section directly.');
        } finally {
            setSubmitting(false);
            setFlow(null);
            setAwaitingInput(false);
            offerMainMenu();
        }
    };

    // ── Handle user option clicks ────────────────────────────────────────────────
    const handleOptionClick = (opt) => {
        // Day response (greeting)
        if (['great','okay','notgood'].includes(opt.value)) {
            handleDayResponse(opt);
            return;
        }
        // Main menu
        if (['medicine','appointment','helper'].includes(opt.value)) {
            handleMainMenu(opt);
            return;
        }
        // Contact helper confirmation
        if (['yes','no'].includes(opt.value) && flow === 'helper') {
            handleContactHelper(opt);
            return;
        }
        // Medicine step with options (mealTiming, selectedDays)
        if (flow === 'medicine') {
            pushUser(opt.label);
            advanceMedicineStep(opt.value, step);
            return;
        }
    };

    // ── Advance medicine step from option ────────────────────────────────────────
    const advanceMedicineStep = (value, currentStep) => {
        const currentDef = MED_STEPS[currentStep];
        let processedValue = value;

        if (currentDef.key === 'selectedDays') {
            processedValue = parseDays(value);
        }

        const newCollected = { ...collected, [currentDef.key]: processedValue };
        setCollected(newCollected);

        const nextStep = currentStep + 1;
        if (nextStep < MED_STEPS.length) {
            setStep(nextStep);
            const next = MED_STEPS[nextStep];
            setTimeout(() => {
                pushBot(next.ask, next.options || null);
                setAwaitingInput(!next.options);
            }, 400);
        } else {
            finalizeMedicine(newCollected);
        }
    };

    // ── Advance appointment step ─────────────────────────────────────────────────
    const advanceAppointmentStep = (value, currentStep) => {
        const currentDef = APT_STEPS[currentStep];
        let processedValue = value === 'skip' ? '' : value;

        const newCollected = { ...collected, [currentDef.key]: processedValue };
        setCollected(newCollected);

        const nextStep = currentStep + 1;
        if (nextStep < APT_STEPS.length) {
            setStep(nextStep);
            setTimeout(() => {
                pushBot(APT_STEPS[nextStep].ask);
                setAwaitingInput(true);
            }, 400);
        } else {
            finalizeAppointment(newCollected);
        }
    };

    // ── Finalize medicine ────────────────────────────────────────────────────────
    const finalizeMedicine = (data) => {
        setAwaitingInput(false);
        
        const rawTimes = data.time || '08:00 AM';
        const parsedTimes = rawTimes.split(',').map(t => parseTimeTo24(t.trim())).filter(Boolean);
        const displayTimes = parsedTimes.join(', ');

        const days = Array.isArray(data.selectedDays) ? data.selectedDays : parseDays(data.selectedDays || 'everyday');

        const summary =
            `✅ Here's a summary of what I'll add:\n\n` +
            `💊 Medicine: ${data.medicineName}\n` +
            `🕐 Time(s): ${displayTimes}\n` +
            `🍽 Meal: ${data.mealTiming} meals\n` +
            `💉 Per intake: ${data.quantityPerIntake}\n` +
            `📦 Total Remaining: ${data.remainingQuantity}\n` +
            `📅 Days: ${days.join(', ')}\n\n` +
            `Shall I add this medicine?`;

        setTimeout(() => {
            pushBot(summary, [
                { label: '✅ Yes, add it!', value: '__confirm_med__' },
                { label: '❌ Cancel', value: '__cancel__' }
            ]);
        }, 400);

        // Override option handler for confirmation
        setFlow('medicine_confirm');
        setCollected({ ...data, timesToSubmit: parsedTimes, selectedDays: days });
    };

    // ── Finalize appointment ─────────────────────────────────────────────────────
    const finalizeAppointment = (data) => {
        setAwaitingInput(false);
        const summary =
            `✅ Here's your appointment summary:\n\n` +
            `📋 Purpose: ${data.purpose}\n` +
            `👨‍⚕️ Doctor: ${data.doctorName}\n` +
            `📱 Contact: ${data.contactNumber}\n` +
            `📅 Date: ${data.date}\n` +
            `🕐 Time: ${data.time}\n` +
            `📍 Place: ${data.place}\n` +
            `${data.remarks ? `📝 Notes: ${data.remarks}\n` : ''}` +
            `\nShall I schedule this appointment?`;

        setTimeout(() => {
            pushBot(summary, [
                { label: '✅ Yes, schedule it!', value: '__confirm_apt__' },
                { label: '❌ Cancel', value: '__cancel__' }
            ]);
        }, 400);

        setFlow('apt_confirm');
    };

    // ── Send text input ──────────────────────────────────────────────────────────
    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || submitting) return;
        setInput('');
        pushUser(trimmed);

        if (flow === 'medicine' && awaitingInput) {
            advanceMedicineStep(trimmed, step);
        } else if (flow === 'appointment' && awaitingInput) {
            advanceAppointmentStep(trimmed, step);
        }
    };

    // ── Handle confirmation options ──────────────────────────────────────────────
    const handleConfirmOption = (opt) => {
        pushUser(opt.label);
        if (opt.value === '__cancel__') {
            setFlow(null);
            setAwaitingInput(false);
            setTimeout(() => { pushBot('Cancelled! No problem. 😊'); offerMainMenu(); }, 400);
            return;
        }
        if (opt.value === '__confirm_med__') {
            submitMedicine(collected);
        }
        if (opt.value === '__confirm_apt__') {
            submitAppointment({
                doctorName: collected.doctorName,
                date: collected.date,
                time: collected.time,
                place: collected.place,
                contactNumber: collected.contactNumber,
                notes: collected.purpose + (collected.remarks ? '\n\n' + collected.remarks : ''),
                specialization: ''
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    // ── Route option click depending on current flow ─────────────────────────────
    const routeOption = (opt) => {
        if (flow === 'medicine_confirm' || flow === 'apt_confirm') {
            handleConfirmOption(opt);
        } else {
            handleOptionClick(opt);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={handleOpen}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl
                    bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center
                    border border-violet-400/30"
                style={{ boxShadow: '0 8px 32px rgba(124,58,237,0.45)' }}
            >
                {open ? (
                    <X className="text-white w-6 h-6" />
                ) : (
                    <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                        className="flex flex-col items-center"
                    >
                        <Sparkles className="text-white w-6 h-6" />
                    </motion.div>
                )}
                {/* Pulse ring */}
                {!open && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-violet-400"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
                {/* Name badge */}
                {!open && (
                    <div className="absolute -top-2 -left-2 bg-white text-violet-700 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                        Ma
                    </div>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        className="fixed bottom-28 right-6 z-50 w-[360px] h-[520px] flex flex-col
                            bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
                        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.2)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-700 to-indigo-700 border-b border-violet-600/30">
                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot className="text-white w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-bold text-sm">Ma</p>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <p className="text-violet-200 text-xs">Your health assistant</p>
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="text-violet-200 w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scroll-smooth"
                            style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b08)' }}>
                            {messages.map(msg => (
                                <Msg key={msg.id} {...msg} onOption={routeOption} />
                            ))}
                        </div>

                        {/* Input */}
                        {(awaitingInput && !submitting) && (
                            <div className="px-3 py-3 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm">
                                <div className="flex gap-2 items-center bg-slate-800 rounded-xl border border-slate-700 px-3 py-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type your answer..."
                                        className="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder-slate-500"
                                        autoFocus
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                        className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40
                                            disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-4 h-4 text-white" />
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="px-4 py-1.5 text-center">
                            <p className="text-slate-700 text-[10px]">Powered by MedSmart Ma · Your Health, Our Priority</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MaBot;
