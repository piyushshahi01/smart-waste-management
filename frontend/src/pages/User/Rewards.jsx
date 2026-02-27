import { API_BASE_URL } from '../../apiConfig';
import { useState, useEffect } from 'react';
import { Gift, Coffee, Train, TreePine, ShoppingBag, CheckCircle2 } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import MagneticButton from '../../components/MagneticButton';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const ICON_MAP = { Gift, Coffee, Train, TreePine, ShoppingBag };

export default function Rewards() {
    const [rewards, setRewards] = useState([]);
    const [userPoints, setUserPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const token = localStorage.getItem("token");

    const fetchData = async () => {
        try {
            const [pointsRes, rewardsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/api/rewards`)
            ]);
            setUserPoints(pointsRes.data.ecoPoints || 0);
            setRewards(rewardsRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleRedeem = async (reward) => {
        if (userPoints < reward.points) return;

        setRedeeming(reward._id);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/rewards/redeem`,
                { rewardId: reward._id },
                { headers: { Authorization: token } }
            );

            setUserPoints(res.data.newBalance);
            setShowSuccess(reward.title);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error("Redemption failed", err);
            alert(err.response?.data?.message || "Failed to redeem reward");
        } finally {
            setRedeeming(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <AnimatedPage className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">

            {/* Header Section */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[32px] p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl -translate-x-1/4"></div>

                <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
                    <h1 className="text-4xl md:text-5xl font-black mb-3 flex items-center justify-center md:justify-start gap-3">
                        <Gift className="w-10 h-10" />
                        Rewards Store
                    </h1>
                    <p className="text-orange-100 text-lg max-w-xl">
                        Turn your sustainable actions into real-world value. Cash in your Eco Points for exclusive vouchers and experiences.
                    </p>
                </div>

                <div className="relative z-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-6 text-center min-w-[200px] shadow-lg">
                    <p className="text-orange-100 font-medium mb-1 uppercase tracking-wider text-sm">Your Balance</p>
                    <div className="text-5xl font-black text-white drop-shadow-md">
                        {userPoints.toLocaleString()}
                    </div>
                    <p className="text-sm font-bold text-yellow-300 mt-2">Eco Points</p>
                </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
                    >
                        <CheckCircle2 className="w-6 h-6" />
                        Successfully redeemed: {showSuccess}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rewards.map((reward, index) => {
                    const Icon = ICON_MAP[reward.icon] || Gift;
                    const canAfford = userPoints >= reward.points;
                    const isRedeeming = redeeming === reward._id;

                    return (
                        <motion.div
                            key={reward._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel rounded-[28px] overflow-hidden flex flex-col group relative"
                        >
                            {/* Card Header Top */}
                            <div className={`h-32 ${reward.bg} dark:bg-opacity-20 flex items-center justify-center relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-black/40"></div>
                                <Icon className={`w-16 h-16 ${reward.color} dark:opacity-80 drop-shadow-sm group-hover:scale-110 transition-transform duration-500`} />
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">{reward.title}</h3>
                                </div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">{reward.provider}</p>

                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-1 line-clamp-3">
                                    {reward.desc}
                                </p>

                                {/* Price & Button area */}
                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost</span>
                                        <span className={`font-black text-lg ${canAfford ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                            {reward.points.toLocaleString()} pts
                                        </span>
                                    </div>

                                    <MagneticButton
                                        onClick={() => handleRedeem(reward)}
                                        disabled={!canAfford || isRedeeming}
                                        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                                            ${isRedeeming ? 'bg-orange-100 text-orange-500 cursor-wait' :
                                                canAfford ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]' :
                                                    'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'}
                                        `}
                                    >
                                        {isRedeeming ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : canAfford ? (
                                            'Redeem Now'
                                        ) : (
                                            'Need More Points'
                                        )}
                                    </MagneticButton>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

        </AnimatedPage>
    );
}
