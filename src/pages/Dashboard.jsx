import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    IndianRupee,
    ArrowUpRight,
    ArrowDownRight,
    Edit3,
    Trash2,
    PieChart as PieChartIcon,
    Activity,
    Plus,
    Tag,
    ArrowRight
} from 'lucide-react';
import api from '../api/axios';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCatName, setNewCatName] = useState('');
    const [editingCat, setEditingCat] = useState(null);

    const fetchData = async () => {
        try {
            const [expRes, catRes] = await Promise.all([
                api.get('/expenses'),
                api.get('/categories')
            ]);
            setExpenses(expRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        try {
            const { data } = await api.post('/categories', { name: newCatName });
            setCategories([...categories, data]);
            setNewCatName('');
        } catch (err) {
            alert('Failed to add category');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure? This will not delete expenses in this category.')) return;
        try {
            await api.delete(`/categories/${id}`);
            setCategories(categories.filter(c => c._id !== id));
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    const handleUpdateCategory = async (id, newName) => {
        try {
            const { data } = await api.put(`/categories/${id}`, { name: newName });
            setCategories(categories.map(c => c._id === id ? data : c));
            setEditingCat(null);
        } catch (err) {
            alert('Failed to update category');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            await api.delete(`/expenses/${id}`);
            setExpenses(expenses.filter(exp => exp._id !== id));
        } catch (err) {
            alert('Failed to delete expense');
        }
    };

    // Data Processing for Charts
    const categoryData = useMemo(() => {
        const counts = {};
        expenses.forEach(exp => {
            counts[exp.category] = (counts[exp.category] || 0) + parseFloat(exp.amount);
        });
        return Object.keys(counts).map(cat => ({ name: cat, value: counts[cat] }));
    }, [expenses]);

    const timelineData = useMemo(() => {
        const sorted = [...expenses].sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
        const daily = {};
        sorted.forEach(exp => {
            const date = new Date(exp.createdAt || exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            daily[date] = (daily[date] || 0) + parseFloat(exp.amount);
        });
        return Object.keys(daily).map(date => ({ date, amount: daily[date] }));
    }, [expenses]);

    const totalExpenses = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    const stats = [
        { label: 'Total Balance', value: `₹${(5000 - totalExpenses).toFixed(2)}`, icon: IndianRupee, color: 'text-blue-400', change: '+2.5%' },
        { label: 'Monthly Income', value: '₹5,000.00', icon: TrendingUp, color: 'text-emerald-400', change: '+12.5%' },
        { label: 'Total Expenses', value: `₹${totalExpenses.toFixed(2)}`, icon: TrendingDown, color: 'text-rose-400', change: '-4.2%' },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                        <p className="text-slate-400 mt-1">Welcome back, <span className="text-white font-medium">{user?.name?.split(' ')[0] || 'User'}</span>! Here's your financial overview.</p>
                    </div>
                    <Link
                        to="/add-expense"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Expense
                    </Link>
                </header>

                {/* Stats Row - full width, 3 even columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors"
                        >
                            <div className={`p-3 rounded-xl bg-white/5 ${stat.color} shrink-0`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
                                <h3 className="text-xl font-bold text-white mt-0.5 truncate">{stat.value}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Row 1: Spending Trend + Category Comparison — equal halves */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Spending Trend */}
                    <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5 text-white font-semibold">
                            <Activity className="w-5 h-5 text-blue-400" />
                            <h3>Spending Trend</h3>
                        </div>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timelineData}>
                                    <defs>
                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', color: '#fff', fontSize: '12px' }} itemStyle={{ color: '#3b82f6' }} cursor={{ stroke: '#3b82f6', strokeWidth: 1 }} />
                                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={2.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Category Comparison Bar Chart */}
                    <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-5 font-semibold">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <h3>Category Comparison</h3>
                        </div>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical" margin={{ left: 16, right: 16 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', color: '#fff' }} />
                                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                {/* Charts Row 2: Pie Chart + Budget Gauge — equal halves */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Expense Allocation Pie */}
                    <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5 text-white font-semibold">
                            <PieChartIcon className="w-5 h-5 text-purple-400" />
                            <h3>Expense Allocation</h3>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="h-[200px] w-[200px] shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={6} dataKey="value" stroke="none">
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', color: '#fff' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3 flex-1 min-w-0">
                                {categoryData.slice(0, 5).map((cat, i) => (
                                    <div key={cat.name} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-sm text-slate-300 truncate">{cat.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-white shrink-0">{((cat.value / totalExpenses) * 100).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Budget Health Gauge */}
                    <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                        <h3 className="text-white font-semibold mb-6">Budget Health</h3>
                        <div className="relative w-44 h-44">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="88" cy="88" r="76" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-white/5" />
                                <circle cx="88" cy="88" r="76" stroke="currentColor" strokeWidth="14" fill="transparent"
                                    strokeDasharray={477}
                                    strokeDashoffset={477 - (477 * Math.min(totalExpenses / 5000, 1))}
                                    strokeLinecap="round"
                                    className={`${totalExpenses > 4000 ? 'text-rose-500' : totalExpenses > 2500 ? 'text-amber-400' : 'text-emerald-500'} transition-all duration-1000`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-white">{Math.round((totalExpenses / 5000) * 100)}%</span>
                                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wide">Utilized</span>
                            </div>
                        </div>
                        <p className={`mt-5 text-sm font-medium ${totalExpenses > 4000 ? 'text-rose-400' : totalExpenses > 2500 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {totalExpenses > 4000 ? '⚠ Near monthly limit!' : totalExpenses > 2500 ? '👀 Halfway through budget' : '✓ Well within budget'}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">₹{totalExpenses.toFixed(0)} of ₹5,000 spent</p>
                    </section>
                </div>

                {/* Categories Section — full width */}
                <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Tag className="w-5 h-5 text-blue-400" />
                            Categories
                        </h2>
                    </div>
                    <div className="flex gap-3 mb-5">
                        <form onSubmit={handleAddCategory} className="flex gap-3 flex-1">
                            <input
                                type="text"
                                placeholder="Add new category..."
                                className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                            />
                            <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all active:scale-95 flex items-center gap-2 text-sm font-medium">
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </form>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {categories.length === 0 ? (
                            <p className="col-span-full text-slate-500 text-sm text-center py-6 italic">No categories yet. Add one above.</p>
                        ) : (
                            categories.map(cat => (
                                <div key={cat._id} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                    {editingCat?._id === cat._id ? (
                                        <input
                                            autoFocus type="text"
                                            className="bg-transparent border-none focus:ring-0 text-white p-0 text-sm w-full"
                                            value={editingCat.name}
                                            onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                                            onBlur={() => handleUpdateCategory(cat._id, editingCat.name)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat._id, editingCat.name)}
                                        />
                                    ) : (
                                        <span className="text-sm font-medium text-slate-200 truncate">{cat.name}</span>
                                    )}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                                        <button onClick={() => setEditingCat(cat)} className="p-1 rounded-lg hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-all">
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDeleteCategory(cat._id)} className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Recent Transactions — full width */}
                <section className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
                        <Link to="/expenses" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 group">
                            View All
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-slate-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Description</th>
                                    <th className="px-6 py-3 font-medium">Category</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Amount</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic">Loading...</td></tr>
                                ) : expenses.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic">No transactions yet.</td></tr>
                                ) : (
                                    expenses.slice(0, 5).map((exp) => (
                                        <motion.tr
                                            key={exp._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-white/5 transition-colors group text-sm"
                                        >
                                            <td className="px-6 py-3.5 font-medium text-white">{exp.title}</td>
                                            <td className="px-6 py-3.5">
                                                <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">{exp.category}</span>
                                            </td>
                                            <td className="px-6 py-3.5 text-slate-500 text-xs">{new Date(exp.date || exp.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-3.5 font-bold text-rose-400">-₹{parseFloat(exp.amount).toFixed(2)}</td>
                                            <td className="px-6 py-3.5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => navigate(`/add-expense?edit=${exp._id}`)} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-slate-400 hover:text-blue-400" title="Edit">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(exp._id)} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;

