import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    IndianRupee,
    TrendingUp,
    PieChart,
    ShieldCheck,
    ArrowRight,
    PlusCircle,
    LayoutDashboard,
    ListFilter,
    Users,
    Globe,
    Zap,
    ChevronRight,
    MousePointer2,
    Calendar,
    LineChart
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/logo.png';

const Home = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    /* 
    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard');
        }
    }, [user, loading, navigate]);
    */

    const features = [
        {
            title: "Smart Tracking",
            description: "Log your expenses in seconds and organize them by categories effortlessly.",
            icon: PlusCircle,
            color: "text-blue-400"
        },
        {
            title: "Visual Insights",
            description: "Understand your spending habits with intuitive charts and real-time analytics.",
            icon: PieChart,
            color: "text-purple-400"
        },
        {
            title: "Budget Management",
            description: "Set monthly goals and stay on track with smart budget health indicators.",
            icon: TrendingUp,
            color: "text-emerald-400"
        },
        {
            title: "Secure & Private",
            description: "Your financial data is encrypted and secure. We prioritize your privacy.",
            icon: ShieldCheck,
            color: "text-rose-400"
        }
    ];

    const steps = [
        {
            title: "Create Account",
            desc: "Sign up in seconds with just your email and start your journey.",
            icon: Users
        },
        {
            title: "Log Expenses",
            desc: "Add your daily spends, categorize them, and set your budget.",
            icon: MousePointer2
        },
        {
            title: "Analyze & Save",
            desc: "Use our visual charts to identify saving opportunities.",
            icon: LineChart
        }
    ];

    const stats = [
        { label: "Active Users", value: "10K+", icon: Users },
        { label: "Expenses Tracked", value: "₹50M+", icon: IndianRupee },
        { label: "Global Reach", value: "50+", icon: Globe },
        { label: "Uptime", value: "99.9%", icon: Zap }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
            {/* Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
                            <img src={logoImage} alt="Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105" />
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                ExpTrack
                            </span>
                        </Link>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <Link to="/dashboard" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
                                        Login
                                    </Link>
                                    <Link to="/register" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm">
                                        Join Now
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
                </div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8">
                            <IndianRupee className="w-3.5 h-3.5" />
                            Master Your Finances
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                            Smart Tracking for <br />
                            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Everyday Expenses
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                            The intelligent way to track your spending, manage your budget, and achieve your financial goals. All in one beautiful dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 group">
                                {user ? "Go to Dashboard" : "Start Free Today"}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {!user && (
                                <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all active:scale-95">
                                    Member Login
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Application Mockup/Placeholder */}
            <section className="max-w-6xl mx-auto px-4 pb-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="relative bg-slate-900 border border-white/10 rounded-3xl p-4 shadow-3xl overflow-hidden shadow-blue-500/10"
                >
                    <div className="absolute top-0 left-0 right-0 h-10 bg-slate-800/50 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="mt-10 p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Mock components to represent the app */}
                        <div className="col-span-1 md:col-span-2 space-y-6">
                            <div className="h-48 rounded-2xl bg-slate-800/40 border border-white/5 p-6 animate-pulse">
                                <div className="w-32 h-4 bg-white/10 rounded mb-4" />
                                <div className="w-full h-24 bg-blue-500/5 rounded-xl border border-blue-500/10" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-32 rounded-2xl bg-slate-800/40 border border-white/5 p-6 animate-pulse">
                                    <div className="w-16 h-4 bg-white/10 rounded mb-4" />
                                    <div className="w-24 h-6 bg-emerald-500/10 rounded" />
                                </div>
                                <div className="h-32 rounded-2xl bg-slate-800/40 border border-white/5 p-6 animate-pulse">
                                    <div className="w-16 h-4 bg-white/10 rounded mb-4" />
                                    <div className="w-24 h-6 bg-rose-500/10 rounded" />
                                </div>
                            </div>
                        </div>
                        <div className="h-full rounded-2xl bg-slate-800/40 border border-white/5 p-6 animate-pulse flex flex-col justify-center items-center">
                            <div className="w-32 h-32 rounded-full border-8 border-purple-500/20 mb-4" />
                            <div className="w-24 h-4 bg-white/10 rounded" />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-4 py-20 bg-slate-900/40 rounded-[3rem] border border-white/5 mb-32">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why choose ExpTrack?</h2>
                    <p className="text-slate-400">Everything you need to manage your money like a pro.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-3xl bg-slate-800/30 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-2"
                        >
                            <div className={`p-4 rounded-2xl bg-white/5 ${feature.color} w-fit mb-6 shadow-lg shadow-black/20`}>
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="max-w-7xl mx-auto px-4 py-32">
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    <div className="lg:w-1/2 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                            Start Tracking in <br />
                            <span className="text-blue-500">3 Simple Steps</span>
                        </h2>
                        <p className="text-slate-400 text-lg">
                            We've designed ExpTrack to be the most friction-less expense management system ever built. No complex forms, just pure efficiency.
                        </p>
                        <div className="space-y-6 pt-4">
                            {steps.map((step, i) => (
                                <div key={i} className="flex gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg mb-1">{step.title}</h4>
                                        <p className="text-slate-500 text-sm">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:w-1/2 relative">
                        <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full" />
                        <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 rounded-xl bg-white/5 border border-white/5 animate-pulse flex items-center px-4 justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10" />
                                            <div className="w-24 h-3 bg-white/10 rounded" />
                                        </div>
                                        <div className="w-16 h-3 bg-blue-500/20 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="max-w-7xl mx-auto px-4 py-20 border-y border-white/5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    {stats.map((stat, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex items-center justify-center text-blue-500 mb-2">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                            <div className="text-slate-500 text-sm uppercase tracking-widest font-bold">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="max-w-5xl mx-auto px-4 py-32 text-center">
                <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[3rem] p-12 md:p-20 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px]" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8">Ready to take control?</h2>
                        <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">
                            Join thousands of users who are already mastering their finances with ExpTrack.
                        </p>
                        <Link to={user ? "/dashboard" : "/register"} className="px-10 py-5 rounded-2xl bg-white text-[#020617] font-bold text-xl hover:bg-slate-200 transition-all active:scale-95 inline-flex items-center gap-3">
                            {user ? "Go to Dashboard" : "Get Started Now"}
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <img src={logoImage} alt="Logo" className="w-6 h-6 rounded-lg opacity-70" />
                        <span className="text-lg font-bold text-slate-500">ExpTrack</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} ExpTrack - Minimalist Expense Tracker. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
