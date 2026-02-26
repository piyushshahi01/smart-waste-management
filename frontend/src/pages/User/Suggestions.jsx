import { API_BASE_URL } from '../../apiConfig';
import { Lightbulb, ArrowRight, Zap, Target, Recycle, RefreshCw, Leaf } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Map string icon names from AI to actual Lucide components
const IconMap = {
    Recycle: Recycle,
    Leaf: Leaf,
    Zap: Zap,
    Target: Target,
    Lightbulb: Lightbulb
};

export default function Suggestions() {
    const [displayedTips, setDisplayedTips] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [goalProgress, setGoalProgress] = useState(80);
    const [error, setError] = useState(null);

    const fetchSuggestions = async () => {
        setIsRefreshing(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const [suggestionsRes, wasteRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/ai/suggestions`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/api/waste`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            // Assign unique IDs to the incoming data for framer-motion keys
            const suggestionsWithIds = suggestionsRes.data.map((item, index) => ({
                ...item,
                id: Date.now() + index
            }));

            // Calculate live goal progress based on total kg recycled (Target: 50kg)
            const logs = wasteRes.data;
            const totalKg = logs.reduce((acc, log) => acc + (log.quantity || 0), 0);
            const goalTarget = 50; // Dynamic goal could be fetched from backend later
            const progress = Math.min(100, Math.round((totalKg / goalTarget) * 100));

            setDisplayedTips(suggestionsWithIds);
            setGoalProgress(progress);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError("Failed to load AI suggestions. Please try again.");
        } finally {
            setIsRefreshing(false);
            setLoadingInitial(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const generateNewTips = () => {
        fetchSuggestions();
    };

    return (
        <AnimatedPage>
            <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            Smart Suggestions <Lightbulb className="w-8 h-8 text-yellow-500 fill-yellow-500/20" />
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                            Personalized AI-driven recommendations based on your waste gen.
                        </p>
                    </div>
                    <button
                        onClick={generateNewTips}
                        disabled={isRefreshing || loadingInitial}
                        className="glass-card flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'AI Analyzing...' : 'Generate New Tips'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                {loadingInitial ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <RefreshCw className="w-12 h-12 animate-spin text-green-500 mb-4" />
                        <p className="text-lg font-medium">Analyzing your waste logs with AI...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {displayedTips.map((sugg) => {
                                const IconComponent = IconMap[sugg.icon] || Lightbulb; // Fallback icon
                                const colorStyles = {
                                    blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400',
                                    green: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400',
                                    yellow: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/50 text-yellow-600 dark:text-yellow-400',
                                    purple: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/50 text-purple-600 dark:text-purple-400',
                                    indigo: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400',
                                };

                                // Default to green style if AI hallucinated a color string
                                const appliedStyle = colorStyles[sugg.color] || colorStyles.green;

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        key={sugg.id}
                                        className="glass-card rounded-2xl p-6 flex flex-col h-full group relative overflow-hidden bg-white/60 dark:bg-gray-900/40 backdrop-blur-2xl shadow-sm border border-gray-100 dark:border-gray-700/50"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-gray-700/20 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>

                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-xl ${appliedStyle} border`}>
                                                <IconComponent className="w-6 h-6" />
                                            </div>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300`}>
                                                {sugg.impact}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{sugg.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 flex-1">{sugg.description}</p>

                                        <a href={`https://www.google.com/search?q=${encodeURIComponent(sugg.title + " waste reduction recycling")}`} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors group/btn w-max cursor-pointer z-10">
                                            Learn how <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </a>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Progress to next goal */}
                <div className="mt-12 bg-white/60 dark:bg-gray-900/40 backdrop-blur-2xl rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Target className="w-6 h-6 text-indigo-500" />
                            Monthly Goal Progress
                        </h2>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">10% Reduction</span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4">You are currently reducing your waste at a steady rate this month. Just a little more effort to hit your 10% goal!</p>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${goalProgress}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full"
                        />
                    </div>
                    <p className="text-right text-sm text-gray-500 dark:text-gray-400 font-medium">{goalProgress}% reached</p>
                </div>
            </div>
        </AnimatedPage>
    );
}