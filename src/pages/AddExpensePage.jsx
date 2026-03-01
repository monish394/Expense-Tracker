import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    IndianRupee,
    Calendar,
    Tag,
    Type,
    ArrowLeft,
    Save,
    Camera,
    UploadCloud,
    Sparkles
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const AddExpensePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [scanResults, setScanResults] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data } = await axios.get('/api/categories', config);
                setCategories(data);
                if (data.length > 0 && !editId) {
                    setFormData(prev => ({ ...prev, category: data[0].name }));
                }
            } catch (err) {
                console.error('Failed to load categories');
            }
        };

        const fetchExpenseData = async () => {
            if (editId) {
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${user.token}` },
                    };
                    const { data } = await axios.get('/api/expenses', config);
                    const expense = data.find(e => e._id === editId);
                    if (expense) {
                        setFormData({
                            title: expense.title,
                            amount: expense.amount,
                            category: expense.category,
                            date: new Date(expense.date).toISOString().split('T')[0]
                        });
                    }
                } catch (err) {
                    setError('Failed to load expense data');
                }
            }
        };

        const init = async () => {
            await fetchCategories();
            await fetchExpenseData();
            setFetching(false);
        };

        if (user) init();
    }, [editId, user]);

    const handleReceiptScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScanning(true);
        setError('');

        const scanData = new FormData();
        scanData.append('receipt', file);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                },
            };
            const { data } = await axios.post('/api/receipts/analyze', scanData, config);

            // Prefill form
            setFormData({
                title: data.detectedData.title || '',
                amount: data.detectedData.amount || '',
                category: data.detectedData.category || formData.category,
                date: data.detectedData.date || formData.date
            });
            setScanResults(data.imageUrl);
        } catch (err) {
            setError('AI Scanning failed. Please fill manually.');
            console.error(err);
        } finally {
            setScanning(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            if (editId) {
                await axios.put(`/api/expenses/${editId}`, formData, config);
            } else {
                await axios.post('/api/expenses', formData, config);
            }
            navigate('/expenses');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save transaction');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading form...</div>;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl"
                >
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {editId ? 'Edit Transaction' : 'New Transaction'}
                        </h1>
                        <p className="text-slate-400">
                            {editId ? 'Modify the details of your expense below.' : 'Record a new spend to track your budget.'}
                        </p>
                    </div>

                    {/* AI Receipt Scanner Section */}
                    {!editId && (
                        <div className="mb-10 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                                <Sparkles className="w-5 h-5" />
                                <span>AI Smart Scan</span>
                            </div>
                            <p className="text-sm text-slate-500 text-center mb-2">Upload a receipt image and let AI fill the form for you.</p>
                            <label className="relative cursor-pointer group">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleReceiptScan}
                                    disabled={scanning}
                                />
                                <div className={`flex items-center gap-3 px-8 py-3 rounded-xl border-2 border-dashed transition-all ${scanning
                                    ? 'border-blue-500 bg-blue-500/10 cursor-wait'
                                    : 'border-slate-700 hover:border-blue-500 hover:bg-white/5 active:scale-95'
                                    }`}>
                                    {scanning ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-blue-400 font-bold">Scanning Receipt...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                                            <span className="text-slate-300 font-medium group-hover:text-white">Upload Receipt Image</span>
                                        </>
                                    )}
                                </div>
                            </label>
                            {scanResults && (
                                <p className="text-xs text-emerald-400 font-medium animate-pulse">✓ Form pre-filled by AI successfully!</p>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-slate-400 mb-2 block ml-1">Title / Description</label>
                                <div className="relative group">
                                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Rent, Coffee, Netflix..."
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-white/10 transition-all font-medium text-lg shadow-inner"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-slate-400 mb-2 block ml-1">Amount</label>
                                    <div className="relative group">
                                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            required
                                            type="number"
                                            placeholder="0.00"
                                            step="0.01"
                                            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border-white/10 transition-all font-bold text-xl shadow-inner"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-400 mb-2 block ml-1">Category</label>
                                    <div className="relative group">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-500 transition-colors" />
                                        <select
                                            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 border-white/10 transition-all appearance-none font-medium shadow-inner"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.length > 0 ? (
                                                categories.map(cat => (
                                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                ))
                                            ) : (
                                                <option disabled>No categories found</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-400 mb-2 block ml-1">Transaction Date</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="date"
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-white/10 transition-all font-medium shadow-inner"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {editId ? 'Update Transaction' : 'Create Transaction'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
};

export default AddExpensePage;
