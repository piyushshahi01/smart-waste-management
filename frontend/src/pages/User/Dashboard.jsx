import { API_BASE_URL } from '../../apiConfig';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, History, PackageOpen, Loader2, Sparkles, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

// Staggered animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function UserDashboard() {
    const [wasteData, setWasteData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ type: 'plastic', quantity: '' });
    const [message, setMessage] = useState({ text: '', type: '' });

    const token = localStorage.getItem('token');

    const fetchWasteData = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/waste`, {
                headers: { Authorization: token }
            });
            if (Array.isArray(res.data)) {
                setWasteData(res.data.reverse());
            } else {
                setWasteData([]);
                console.error("API returned non-array data:", res.data);
            }
        } catch (err) {
            console.error("Failed to load history:", err);
            setWasteData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWasteData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            await axios.post(`${API_BASE_URL}/api/waste`,
                { type: formData.type, quantity: Number(formData.quantity) },
                { headers: { Authorization: token } }
            );

            setMessage({ text: 'Waste logged successfully!', type: 'success' });
            setFormData({ ...formData, quantity: '' });
            fetchWasteData(); // Refresh history

        } catch (err) {
            setMessage({ text: 'Failed to log waste. Try again.', type: 'error' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    // Calculate weekly total for goals
    const weeklyTotal = wasteData.slice(0, 7).reduce((acc, curr) => acc + curr.quantity, 0);
    const weeklyGoal = 20; // Example goal
    const progress = Math.min((weeklyTotal / weeklyGoal) * 100, 100);

    // Mock sparkline data based on actual logs
    const sparklineData = [...wasteData].reverse().slice(-14).map((log, i) => ({
        day: i, val: log.quantity
    }));

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <motion.h1
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 flex items-center gap-3"
            >
                <Sparkles className="w-8 h-8 text-orange-400" />
                My Waste Dashboard
            </motion.h1>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">

                {/* Log New Waste Form - Bento Block */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="md:col-span-5 lg:col-span-4 bg-white/60 dark:bg-black/40 border border-white/50 dark:border-white/5 p-6 rounded-[24px] backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] h-fit relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full pointer-events-none"></div>

                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-orange-400 relative z-10">
                        <PlusCircle className="w-5 h-5 text-orange-400" />
                        Quick Log
                    </h2>

                    <AnimatePresence>
                        {message.text && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`mb-4 px-4 py-3 rounded-xl text-sm border font-medium ${message.type === 'success'
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400'
                                    : 'bg-red-100 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400'
                                    }`}
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Waste Type</label>
                            <div className="relative">
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-white/50 dark:bg-[#0a0a0f]/80 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all appearance-none outline-none font-medium shadow-sm backdrop-blur-md"
                                >
                                    <option value="plastic">♻️ Plastic</option>
                                    <option value="paper">📄 Paper & Cardboard</option>
                                    <option value="glass">🧊 Glass</option>
                                    <option value="metal">🥫 Metal / Cans</option>
                                    <option value="organic">🍎 Organic / Food</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-2">▼</div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Quantity (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                required
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full bg-white/50 dark:bg-[#0a0a0f]/80 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-mono outline-none shadow-sm backdrop-blur-md"
                                placeholder="e.g. 2.5"
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={submitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-2xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <span className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-[shimmer_1.5s_infinite]"></span>
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin relative z-10" /> : <span className="relative z-10">Submit Entry</span>}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Goals & Sparkline - Bento Block */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="md:col-span-7 lg:col-span-4 bg-white/60 dark:bg-black/40 border border-white/50 dark:border-white/5 p-6 rounded-[24px] backdrop-blur-2xl shadow-sm flex flex-col justify-between"
                >
                    <div>
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-orange-400">
                            <Target className="w-5 h-5" />
                            Weekly Eco Goal
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Recycle {weeklyGoal}kg of waste this week to earn the Eco Warrior badge.</p>
                    </div>

                    <div className="mt-6 mb-2">
                        <div className="flex justify-between text-sm font-semibold mb-2">
                            <span className="text-gray-700 dark:text-gray-300">{weeklyTotal.toFixed(1)}kg Achieved</span>
                            <span className="text-orange-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800/50 rounded-full h-3 overflow-hidden shadow-inner flex">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full relative"
                            >
                                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[stripes_1s_linear_infinite]"></div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="mt-6 h-28 w-full border-t border-gray-200 dark:border-white/5 pt-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">14-Day Activity Trend</span>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparklineData}>
                                <Line type="monotone" dataKey="val" stroke="#f97316" strokeWidth={3} dot={false} animationDuration={2000} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', backdropFilter: 'blur(12px)' }} itemStyle={{ color: '#f97316' }} cursor={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Waste History List - Bento Block */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="md:col-span-12 lg:col-span-4 bg-white/60 dark:bg-black/40 border border-white/50 dark:border-white/5 p-6 rounded-[24px] backdrop-blur-2xl shadow-sm flex flex-col h-[500px]"
                >
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-orange-400">
                        <History className="w-5 h-5" />
                        Recent Logs
                    </h2>

                    <div className="overflow-y-auto flex-1 pr-2 no-scrollbar">
                        {loading ? (
                            <div className="flex justify-center items-center h-full text-gray-500">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500/50" />
                            </div>
                        ) : wasteData.length === 0 ? (
                            <div className="text-center py-16 px-4 bg-gray-50/50 dark:bg-black/20 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 h-full flex flex-col justify-center items-center">
                                <PackageOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 font-medium">You haven't logged any waste yet.</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Submit your first entry to start building your eco-profile!</p>
                            </div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="space-y-3"
                            >
                                {wasteData.map((item) => (
                                    <motion.div
                                        variants={itemVariants}
                                        key={item._id}
                                        className="bg-white/80 dark:bg-[#0a0a0f] hover:bg-white dark:hover:bg-[#12121a] border border-gray-100 dark:border-white/5 p-4 rounded-2xl transition-all duration-300 group flex items-center shadow-sm dark:shadow-none"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-black/40 flex flex-col justify-center items-center mr-4 shadow-inner border border-gray-200/50 dark:border-white/5 shrink-0 group-hover:scale-105 transition-transform">
                                            <span className="text-xs font-bold text-gray-600 dark:text-orange-400">
                                                {new Date(item.date).getDate()}
                                            </span>
                                            <span className="text-[10px] text-gray-400 uppercase">
                                                {new Date(item.date).toLocaleString('default', { month: 'short' })}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 capitalize truncate">{item.type} Recycling</p>
                                            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1 mt-0.5">
                                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse inline-block shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
                                                {item.points ? `Earned ${item.points} Eco Points` : 'Processed & Logged'}
                                            </p>
                                        </div>

                                        <div className="text-right ml-2 shrink-0">
                                            <p className="font-bold text-lg text-gray-900 dark:text-white">
                                                {item.quantity} <span className="text-sm font-normal text-gray-500">kg</span>
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.div>

            </div>
            {/* Embedded CSS for Shimmer and Stripes */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    100% { transform: translateX(100%) skewX(-15deg); }
                }
                @keyframes stripes {
                    from { background-position: 1rem 0; }
                    to { background-position: 0 0; }
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .no-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}} />
        </div>
    );
}
