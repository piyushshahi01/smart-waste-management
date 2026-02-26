import { API_BASE_URL } from '../../apiConfig';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Loader2, ArrowDownCircle, Trees, Waves, Zap } from 'lucide-react';

// A single full-screen slide component for the scrollytelling effect
const ImpactSlide = ({ children, index, totalSlides, bgClass }) => {
    return (
        <section className={`min-h-[100vh] w-full flex items-center justify-center relative ${bgClass}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="max-w-4xl mx-auto px-6 text-center z-10"
            >
                {children}
            </motion.div>

            {/* Scroll Indicator (except on last slide) */}
            {index < totalSlides - 1 && (
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
                >
                    <ArrowDownCircle className="w-10 h-10" />
                </motion.div>
            )}
        </section>
    );
};

export default function ImpactReport() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchImpact = async () => {
            try {
                const [wasteRes, meRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/waste`, { headers: { Authorization: token } }),
                    axios.get(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: token } })
                ]);

                // Calculate total weight (Fallback to synthetic weight if they have points but no logs)
                let totalKg = wasteRes.data.reduce((sum, item) => sum + (item.quantity || 0), 0);
                if (totalKg === 0 && (meRes.data.ecoPoints || 0) > 0) {
                    totalKg = (meRes.data.ecoPoints || 0) / 10; // Synthetic baseline weight
                }

                // Group by type to find most recycled material
                const types = {};
                wasteRes.data.forEach(item => {
                    types[item.type] = (types[item.type] || 0) + (item.quantity || 0);
                });
                const topMaterial = Object.entries(types).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Items';

                setStats({
                    totalWeight: totalKg,
                    logsCount: wasteRes.data.length,
                    points: meRes.data.ecoPoints || 0,
                    topMaterial: topMaterial,
                    // Fun equivalent calculations
                    turtlesSaved: Math.floor(totalKg * 1.5),
                    kwhSaved: Math.floor(totalKg * 4.2),
                    treesPlantedEquivalent: Math.floor(totalKg / 10)
                });
            } catch (err) {
                console.error("Failed to load impact stats:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchImpact();
    }, [token]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f0c1b]">
                <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (!stats || (stats.logsCount === 0 && stats.points === 0)) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-[#0f0c1b] text-white p-8 text-center">
                <Trees className="w-24 h-24 text-gray-700 mb-6" />
                <h1 className="text-4xl font-bold mb-4">No Data Yet</h1>
                <p className="text-gray-400 text-xl max-w-md">Start logging your waste to build your environmental impact report!</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0f0c1b] text-white overflow-x-hidden pt-16 md:pt-0">
            {/* Slide 1: Intro */}
            <ImpactSlide index={0} totalSlides={4} bgClass="bg-gradient-to-b from-[#0f0c1b] to-purple-900/40">
                <motion.h2
                    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}
                    className="text-2xl md:text-3xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-4"
                >
                    Your 2026
                </motion.h2>
                <motion.h1
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, type: "spring" }}
                    className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]"
                >
                    Impact Report
                </motion.h1>
                <p className="mt-8 text-xl text-gray-300">Scroll to discover your global footprint.</p>
            </ImpactSlide>

            {/* Slide 2: Weight & Material */}
            <ImpactSlide index={1} totalSlides={4} bgClass="bg-gradient-to-b from-purple-900/40 to-blue-900/40">
                <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                    You've kept <br />
                    <span className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-300">
                        {stats.totalWeight.toFixed(1)}kg
                    </span><br />
                    of waste out of landfills.
                </h2>
                <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 inline-block">
                    <p className="text-2xl text-blue-200">Your most recycled material was <strong className="text-white capitalize">{stats.topMaterial}</strong>.</p>
                </div>
            </ImpactSlide>

            {/* Slide 3: Real World Equivalents */}
            <ImpactSlide index={2} totalSlides={4} bgClass="bg-gradient-to-b from-blue-900/40 to-emerald-900/40">
                <h2 className="text-3xl md:text-5xl font-bold mb-12">What does that actually mean?</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-3xl backdrop-blur-sm">
                        <Waves className="w-12 h-12 text-emerald-400 mb-6" />
                        <p className="text-xl text-emerald-100 mb-2">Equivalent to saving</p>
                        <p className="text-5xl font-black text-emerald-400">{stats.turtlesSaved} Sea Turtles</p>
                        <p className="text-sm text-emerald-300/60 mt-4">from oceanic plastic pollution.</p>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-8 rounded-3xl backdrop-blur-sm">
                        <Zap className="w-12 h-12 text-yellow-400 mb-6" />
                        <p className="text-xl text-yellow-100 mb-2">Conserved</p>
                        <p className="text-5xl font-black text-yellow-400">{stats.kwhSaved} kWh</p>
                        <p className="text-sm text-yellow-300/60 mt-4">of energy vs producing new materials.</p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 p-8 rounded-3xl backdrop-blur-sm md:col-span-2 lg:col-span-1">
                        <Trees className="w-12 h-12 text-green-400 mb-6" />
                        <p className="text-xl text-green-100 mb-2">Same carbon offset as</p>
                        <p className="text-5xl font-black text-green-400">{stats.treesPlantedEquivalent} Trees</p>
                        <p className="text-sm text-green-300/60 mt-4">planted entirely in your name.</p>
                    </div>
                </div>
            </ImpactSlide>

            {/* Slide 4: Outro */}
            <ImpactSlide index={3} totalSlides={4} bgClass="bg-gradient-to-b from-emerald-900/40 to-[#0f0c1b]">
                <h2 className="text-5xl md:text-7xl font-black mb-8">
                    You are in the top <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500">
                        14%
                    </span><br />
                    of Global Eco Warriors!
                </h2>
                <p className="text-2xl text-gray-300 mb-12">With {stats.points.toLocaleString()} total Eco Points.</p>

                <button
                    onClick={() => window.history.back()}
                    className="px-8 py-4 bg-white text-[#0f0c1b] font-bold rounded-full text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                >
                    Back to Dashboard
                </button>
            </ImpactSlide>

        </div>
    );
}
