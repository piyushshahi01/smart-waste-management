import { API_BASE_URL } from '../../apiConfig';
import { Award, Leaf, Star, Shield, TrendingUp, Lock, Loader2 } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Profile() {
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [wasteLogs, setWasteLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPoints, setTotalPoints] = useState(0);

    const [streak, setStreak] = useState(0);

    const userStr = localStorage.getItem("user");
    const userObj = userStr ? JSON.parse(userStr) : null;
    const userName = userObj?.name || 'Eco User';

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [wasteRes, meRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/waste`, { headers: { Authorization: token } }),
                    axios.get(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: token } })
                ]);

                const logs = wasteRes.data.reverse();
                setWasteLogs(logs);

                // Set points and streak directly from the backend user model
                setTotalPoints(meRes.data.ecoPoints || 0);
                setStreak(meRes.data.currentStreak || 0);

                // Update local storage name just in case
                if (meRes.data.name) {
                    localStorage.setItem("user", JSON.stringify({ ...meRes.data, password: '' }));
                }

            } catch (err) {
                console.error("Failed to fetch profile data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token]);

    const badges = [
        { id: 1, name: 'Getting Started', icon: Leaf, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', unlocked: totalPoints > 0, desc: "Log your first piece of waste." },
        { id: 2, name: 'Eco Warrior', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', unlocked: totalPoints >= 50, desc: "Earn 50 Eco Points through recycling." },
        { id: 3, name: 'Recycling Champion', icon: Award, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', unlocked: totalPoints >= 100, desc: "Earn 100 Eco Points. You're making a huge impact!" },
        { id: 4, name: 'Earth Saver', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', unlocked: totalPoints >= 500, desc: "Earn 500 Eco Points. A true environmental guardian." },
        { id: 5, name: 'Zero Waste Guru', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', unlocked: totalPoints >= 1000, desc: "Amass 1,000 Eco Points. A legendary achievement." },
    ];

    const unlockedCount = badges.filter(b => b.unlocked).length;

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <AnimatedPage className="max-w-5xl mx-auto space-y-8 p-4 md:p-8">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <motion.div whileHover={{ scale: 1.05 }} className="w-32 h-32 bg-white rounded-full p-1 shadow-2xl cursor-pointer">
                        <div className="w-full h-full bg-orange-100 rounded-full flex items-center justify-center text-4xl text-orange-600 font-bold overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=fed7aa`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    </motion.div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-4xl font-bold mb-2 capitalize">{userName}</h1>
                        <p className="text-orange-100 text-lg mb-4">Level {Math.floor(totalPoints / 100) + 1} Eco Contributor</p>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <span className="bg-white/20 px-4 py-2 rounded-full font-medium flex items-center gap-2 backdrop-blur-sm shadow-sm">
                                <Shield className="w-5 h-5 text-blue-200 fill-blue-200" /> {wasteLogs.length} Total Logs
                            </span>
                            <span className="bg-white/20 px-4 py-2 rounded-full font-medium flex items-center gap-2 backdrop-blur-sm shadow-sm">
                                <Leaf className="w-5 h-5 text-yellow-300 fill-yellow-300" /> {totalPoints.toLocaleString()} Eco Points
                            </span>
                            <span className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-orange-400/30 px-4 py-2 rounded-full font-bold flex items-center gap-2 backdrop-blur-sm shadow-sm text-yellow-100">
                                🔥 {streak} Day Streak!
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Badges / Achievements */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel rounded-[24px] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Award className="w-6 h-6 text-yellow-500" />
                                Badges System & Achievements
                            </h2>
                            <span className="text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                                {unlockedCount} / {badges.length} Unlocked
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {badges.map((badge) => {
                                const Icon = badge.icon;
                                const isSelected = selectedBadge === badge.id;
                                return (
                                    <motion.div
                                        key={badge.id}
                                        onClick={() => setSelectedBadge(isSelected ? null : badge.id)}
                                        whileTap={{ scale: 0.95 }}
                                        className={`flex flex-col items-center text-center p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${isSelected ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/20 shadow-lg' : 'border-gray-100 dark:border-gray-700 glass-card hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
                                    >
                                        {!badge.unlocked && (
                                            <div className="absolute inset-0 bg-gray-100/60 dark:bg-gray-900/70 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center">
                                                <Lock className="w-6 h-6 text-gray-500 dark:text-gray-400 mb-1" />
                                            </div>
                                        )}
                                        <div className={`w-14 h-14 ${badge.bg} rounded-full flex items-center justify-center mb-3 shadow-inner ${badge.unlocked ? 'shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}`}>
                                            <Icon className={`w-7 h-7 ${badge.color}`} />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 z-0">{badge.name}</span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <AnimatePresence>
                            {selectedBadge && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="bg-gray-50 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center overflow-hidden"
                                >
                                    <p className="text-gray-700 dark:text-gray-300">
                                        {badges.find(b => b.id === selectedBadge).desc}
                                    </p>
                                    {!badges.find(b => b.id === selectedBadge).unlocked && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Keep earning Eco Points to unlock this badge!</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-white/60 dark:bg-gray-900/40 rounded-[24px] backdrop-blur-2xl shadow-sm border border-white/50 dark:border-gray-700/50 p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                            <TrendingUp className="w-6 h-6 text-orange-500" />
                            Recent Activity
                        </h2>

                        <div className="space-y-4">
                            {wasteLogs.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity. Start logging waste to earn points!</p>
                            ) : (
                                wasteLogs.slice(0, 3).map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white capitalize">Recycled {log.quantity}kg of {log.type}</h4>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.date).toLocaleDateString()}</span>
                                        </div>
                                        <span className="font-bold text-orange-600 dark:text-orange-400">+{log.points || 0} pts</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar / Leaderboard */}
                <div className="space-y-6">
                    <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-2xl rounded-[24px] shadow-sm border border-white/50 dark:border-gray-700/50 p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Local Leaderboard 🏆</h2>

                        <div className="space-y-4">
                            {[
                                { pos: 1, name: 'Sarah M.', score: '2,450' },
                                { pos: 2, name: `${userName} (You)`, score: totalPoints.toLocaleString(), isYou: true },
                                { pos: 3, name: 'Mike T.', score: '1,100' },
                                { pos: 4, name: 'Emily R.', score: '950' },
                            ].sort((a, b) => parseInt(b.score.replace(',', '')) - parseInt(a.score.replace(',', ''))).map((user, index) => (
                                <div key={index} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${user.isYou ? 'bg-orange-50 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800/50 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm ${index === 0 ? 'bg-yellow-200 text-yellow-700' :
                                        index === 1 ? 'bg-gray-200 text-gray-700' :
                                            index === 2 ? 'bg-amber-200 text-amber-800' :
                                                'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                        }`}>
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1 font-medium text-gray-900 dark:text-white">
                                        {user.name}
                                    </div>
                                    <div className="font-bold text-orange-600 dark:text-orange-400">
                                        {user.score}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[24px] p-6 text-white text-center shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                        <h3 className="font-bold text-lg mb-2 relative z-10">Invite Friends</h3>
                        <p className="text-orange-100 text-sm mb-4 relative z-10">Earn 100 Eco Points for every friend who joins and recycles!</p>
                        <button className="bg-white text-red-600 font-bold py-3 w-full rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-lg relative z-10">
                            Share Invite Link
                        </button>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}