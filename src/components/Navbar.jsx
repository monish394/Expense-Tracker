import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import logoImage from '../assets/logo.png';
import {
    LayoutDashboard,
    ListFilter,
    PlusCircle,
    LogOut,
    User,
    KeyRound,
    ChevronDown,
    X,
    Menu,
    Camera,
    Check,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const dropdownRef = useRef(null);

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Expenses', path: '/expenses', icon: ListFilter },
        { label: 'Add Expense', path: '/add-expense', icon: PlusCircle },
    ];

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <>
            <nav className="border-b border-white/5 bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Left Side: Logo & Desktop Links */}
                        <div className="flex items-center gap-8">
                            <Link to={user ? "/" : "/home"} className="flex items-center gap-2 group">
                                <img src={logoImage} alt="ExpTrack Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform" />
                                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                    ExpTrack
                                </span>
                            </Link>

                            <div className="hidden lg:flex items-center gap-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === item.path
                                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Profile & Mobile Menu Toggle */}
                        <div className="flex items-center gap-2">
                            {/* Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowProfileMenu(p => !p)}
                                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    {user?.profileImage ? (
                                        <img src={user.profileImage} alt="avatar" className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-500/30" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                            {user?.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showProfileMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                                        >
                                            <div className="p-4 border-b border-white/5 bg-white/5">
                                                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                            </div>
                                            <div className="p-1">
                                                <MenuButton icon={<User className="w-3.5 h-3.5" />} label="Edit Profile" onClick={() => { setShowEditProfile(true); setShowProfileMenu(false); }} />
                                                <MenuButton icon={<KeyRound className="w-3.5 h-3.5" />} label="Security" onClick={() => { setShowChangePassword(true); setShowProfileMenu(false); }} />
                                                <div className="h-px bg-white/5 my-1" />
                                                <MenuButton
                                                    icon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
                                                    label="Sign Out"
                                                    labelClass="text-rose-400"
                                                    onClick={() => {
                                                        logout();
                                                        navigate('/home');
                                                    }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Mobile Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Content */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="lg:hidden border-t border-white/5 overflow-hidden bg-slate-900/90 backdrop-blur-xl"
                        >
                            <div className="p-4 space-y-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${location.pathname === item.path
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : 'text-slate-400 hover:bg-white/5'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium text-base">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <AnimatePresence>
                {showEditProfile && <Modal title="Edit Profile" onClose={() => setShowEditProfile(false)}><EditProfileForm onClose={() => setShowEditProfile(false)} /></Modal>}
            </AnimatePresence>
            <AnimatePresence>
                {showChangePassword && <Modal title="Change Password" onClose={() => setShowChangePassword(false)}><ChangePasswordForm onClose={() => setShowChangePassword(false)} /></Modal>}
            </AnimatePresence>
        </>
    );
};

const MenuButton = ({ icon, iconBg, label, labelClass = 'text-slate-300 hover:text-white', onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${labelClass} hover:bg-white/5 transition-all`}>
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>{icon}</div>
        {label}
    </button>
);

const Modal = ({ title, children, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
    >
        <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 24 }}
            className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                    <X className="w-5 h-5" />
                </button>
            </div>
            {children}
        </motion.div>
    </motion.div>
);

// ===== Edit Profile Form =====
const EditProfileForm = ({ onClose }) => {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', ok: true });
    const fileRef = useRef();

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        setMsg({ text: '', ok: true });
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            const { data } = await api.post('/auth/upload-avatar', fd);
            updateUser({ profileImage: data.profileImage });
            setMsg({ text: 'Profile photo updated!', ok: true });
        } catch {
            setMsg({ text: 'Upload failed. Try again.', ok: false });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg({ text: '', ok: true });
        try {
            const { data } = await api.put('/auth/update-profile', { name });
            updateUser({ name: data.name });
            setMsg({ text: 'Profile updated successfully!', ok: true });
            setTimeout(() => onClose(), 1200);
        } catch {
            setMsg({ text: 'Failed to update profile.', ok: false });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="avatar" className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/10" />
                    ) : (
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                    <button
                        onClick={() => fileRef.current.click()}
                        disabled={uploading}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg transition-all active:scale-90 disabled:opacity-50"
                    >
                        {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <p className="text-xs text-slate-500">Click the camera icon to change photo</p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-400 mb-1.5 block">Full Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-400 mb-1.5 block">Email</label>
                    <input type="email" value={user?.email || ''} disabled className="w-full bg-slate-800/30 border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" />
                </div>
                {msg.text && (
                    <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${msg.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {msg.ok ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        {msg.text}
                    </div>
                )}
                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium">Cancel</button>
                    <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 active:scale-95">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// ===== Change Password Form =====
const ChangePasswordForm = ({ onClose }) => {
    const { user } = useAuth();
    const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', ok: true });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPass !== form.confirm) return setMsg({ text: 'New passwords do not match.', ok: false });
        if (form.newPass.length < 6) return setMsg({ text: 'Password must be at least 6 characters.', ok: false });
        setLoading(true);
        setMsg({ text: '', ok: true });
        try {
            await api.put('/auth/change-password', { currentPassword: form.current, newPassword: form.newPass });
            setMsg({ text: 'Password changed successfully!', ok: true });
            setTimeout(() => onClose(), 1200);
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Failed to change password.', ok: false });
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { key: 'current', label: 'Current Password' },
        { key: 'newPass', label: 'New Password' },
        { key: 'confirm', label: 'Confirm New Password' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label }) => (
                <div key={key}>
                    <label className="text-sm font-medium text-slate-400 mb-1.5 block">{label}</label>
                    <input
                        required type="password"
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                    />
                </div>
            ))}
            {msg.text && (
                <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${msg.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {msg.ok ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {msg.text}
                </div>
            )}
            <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all disabled:opacity-50 active:scale-95">
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </div>
        </form>
    );
};

export default Navbar;
