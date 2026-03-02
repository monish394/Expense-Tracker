import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginSchema, validateField } from '../utils/validation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, RefreshCw, CheckCircle2, ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Login = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        otp: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
    const [loginMethod, setLoginMethod] = useState('password');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const { user, login, sendOTP, verifyOTP } = useAuth();
    const navigate = useNavigate();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (user) {
            console.log('User detected, redirecting to dashboard...');
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    // Clear success message after 5 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Timer logic for OTP
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setApiError('');
        setSuccessMessage('');
    };

    const handleSendOTP = async () => {
        // Validate email
        if (!formData.email) {
            setErrors({ email: 'Email is required' });
            return;
        }

        // Basic email validation
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(formData.email)) {
            setErrors({ email: 'Please enter a valid email' });
            return;
        }

        setApiError('');
        setIsSubmitting(true);

        try {
            await sendOTP(formData.email);
            setShowOtpInput(true);
            setOtpSent(true);
            setTimeLeft(60);
            setSuccessMessage('OTP sent to your email!');
        } catch (err) {
            console.error('Send OTP Error:', err);
            setApiError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous messages
        setApiError('');
        setErrors({});

        // OTP Login Flow
        if (loginMethod === 'otp') {
            if (!showOtpInput) {
                await handleSendOTP();
                return;
            }

            // Validate OTP
            if (!formData.otp) {
                setErrors({ otp: 'OTP is required' });
                return;
            }

            if (formData.otp.length !== 6) {
                setErrors({ otp: 'OTP must be 6 digits' });
                return;
            }

            if (timeLeft === 0) {
                setApiError('OTP has expired. Please request a new one.');
                return;
            }

            setIsSubmitting(true);

            try {
                console.log('--- OTP Verification Attempt ---');
                console.log('Email:', formData.email, 'OTP:', formData.otp);

                const data = await verifyOTP(formData.email, formData.otp);
                console.log('OTP Verified successfully. User data:', data);

                setSuccessMessage(`Welcome, ${data.name}! Redirecting...`);

                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 800);
            } catch (err) {
                console.error('OTP Verification Failed:', err);
                setApiError(err.response?.data?.message || 'Invalid or expired OTP.');
            } finally {
                setIsSubmitting(false);
                console.log('--- OTP Attempt Finished ---');
            }
            return;
        }

        // Password Login Flow
        // Validate email
        if (!formData.email) {
            setErrors(prev => ({ ...prev, email: 'Email is required' }));
            return;
        }

        // Validate password
        if (!formData.password) {
            setErrors(prev => ({ ...prev, password: 'Password is required' }));
            return;
        }

        if (formData.password.length < 6) {
            setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
            return;
        }

        // Optional: Use your validation schema
        if (validateField && loginSchema) {
            const validationErrors = validateField(loginSchema, {
                email: formData.email,
                password: formData.password
            });

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
        }

        // Start loading
        setIsSubmitting(true);

        try {
            console.log('--- Password Login Attempt ---');
            console.log('Email:', formData.email);

            const data = await login(formData.email, formData.password);
            console.log('Login API Success. User data:', data);

            setSuccessMessage(`Welcome back, ${data.name}! Redirecting...`);

            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 800);
        } catch (err) {
            console.error('Password Login Failed:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Login failed. Invalid email or password.';
            setApiError(errorMessage);
        } finally {
            setIsSubmitting(false);
            console.log('--- Login Attempt Finished ---');
        }
    };

    const switchToPassword = () => {
        setLoginMethod('password');
        setShowOtpInput(false);
        setApiError('');
        setErrors({});
        setTimeLeft(0);
        setFormData(prev => ({ ...prev, otp: '' }));
    };

    const switchToOTP = () => {
        setLoginMethod('otp');
        setApiError('');
        setErrors({});
        setFormData(prev => ({ ...prev, password: '' }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10"
            >
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Welcome Back
                    </h2>
                    <p className="text-slate-400 mt-2">Sign in to continue tracking your expenses</p>
                </div>

                {/* Login Method Toggle */}
                <div className="flex bg-slate-900/50 p-1 rounded-xl mb-8 border border-white/5 relative">
                    <div
                        className={cn(
                            "absolute inset-y-1 w-[calc(50%-4px)] bg-blue-600 rounded-lg transition-all duration-300 ease-out shadow-lg shadow-blue-600/20",
                            loginMethod === 'password' ? "left-1" : "left-[calc(50%+2px)]"
                        )}
                    />
                    <button
                        type="button"
                        onClick={switchToPassword}
                        className={cn(
                            "flex-1 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors duration-200",
                            loginMethod === 'password' ? "text-white" : "text-slate-400 hover:text-slate-200"
                        )}
                    >
                        Password
                    </button>
                    <button
                        type="button"
                        onClick={switchToOTP}
                        className={cn(
                            "flex-1 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors duration-200",
                            loginMethod === 'otp' ? "text-white" : "text-slate-400 hover:text-slate-200"
                        )}
                    >
                        Email OTP
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error and Success Messages */}
                    <AnimatePresence mode="wait">
                        {apiError && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center"
                            >
                                {apiError}
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm text-center flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {successMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Email Field */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                name="email"
                                type="email"
                                disabled={showOtpInput && loginMethod === 'otp'}
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                className={cn(
                                    "w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 transition-all disabled:opacity-50",
                                    errors.email ? "border-red-500/50 focus:ring-red-500/20" : "focus:ring-blue-500/20 focus:border-blue-500/50"
                                )}
                            />
                        </div>
                        {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
                    </div>

                    {/* Password or OTP Field */}
                    <AnimatePresence mode="wait">
                        {loginMethod === 'password' ? (
                            <motion.div
                                key="password-field"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-1.5"
                            >
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-medium text-slate-300">Password</label>
                                    <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-11 outline-none focus:ring-2 transition-all",
                                            errors.password ? "border-red-500/50 focus:ring-red-500/20" : "focus:ring-blue-500/20 focus:border-blue-500/50"
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>}
                            </motion.div>
                        ) : (
                            showOtpInput && (
                                <motion.div
                                    key="otp-field"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-1.5"
                                >
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-sm font-medium text-slate-300">Enter OTP</label>
                                        <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors",
                                            timeLeft > 0 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                                        )}>
                                            <RefreshCw className={cn("w-2.5 h-2.5", timeLeft > 0 && "animate-spin-slow")} />
                                            {timeLeft > 0 ? `Expires in ${timeLeft}s` : "Expired"}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            name="otp"
                                            type="text"
                                            placeholder="••••••"
                                            maxLength={6}
                                            value={formData.otp}
                                            onChange={handleChange}
                                            className={cn(
                                                "w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 transition-all tracking-[0.8em] font-mono text-center text-lg",
                                                errors.otp || timeLeft === 0 ? "border-rose-500/50 focus:ring-rose-500/20" : "focus:ring-blue-500/20 focus:border-blue-500/50"
                                            )}
                                        />
                                    </div>
                                    {errors.otp && <p className="text-red-400 text-xs mt-1 ml-1">{errors.otp}</p>}
                                    <div className="flex justify-between items-center mt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowOtpInput(false);
                                                setFormData(prev => ({ ...prev, otp: '' }));
                                                setTimeLeft(0);
                                            }}
                                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            Change Email
                                        </button>
                                        {timeLeft === 0 && (
                                            <button
                                                type="button"
                                                onClick={handleSendOTP}
                                                disabled={isSubmitting}
                                                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors disabled:opacity-50"
                                            >
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || (loginMethod === 'otp' && showOtpInput && timeLeft === 0)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {loginMethod === 'otp' && !showOtpInput ? 'Send OTP' : 'Sign In'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-slate-400 mt-8 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                        Sign Up Free
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;