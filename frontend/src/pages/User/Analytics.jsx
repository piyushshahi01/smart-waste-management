import { API_BASE_URL } from '../../apiConfig';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import AnimatedPage from '../../components/AnimatedPage';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const COLORS = ['#3B82F6', '#22C55E', '#EAB308', '#EF4444', '#8B5CF6', '#F97316'];
const TYPE_COLORS = {
    'plastic': '#3B82F6',
    'organic': '#22C55E',
    'paper': '#EAB308',
    'metal': '#64748B',
    'glass': '#06B6D4',
    'e-waste': '#EF4444'
};

// Custom Eco Score Circle Gauge Component
function EcoScoreGauge({ score }) {
    const [currentScore, setCurrentScore] = useState(0);
    const circleRef = useRef(null);

    useEffect(() => {
        // SVG Circle properties
        const circle = circleRef.current;
        if (!circle) return;

        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;

        // Reset scroll trigger and animations if score changes
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: "#eco-score-container",
                start: "top 85%",
                onEnter: () => {
                    // Animate Score Number
                    gsap.to({ val: 0 }, {
                        val: score,
                        duration: 2,
                        ease: "power3.out",
                        onUpdate: function () {
                            setCurrentScore(Math.round(this.targets()[0].val));
                        }
                    });

                    // Animate SVG Stroke
                    const offset = circumference - (score / 100) * circumference;
                    gsap.to(circle, {
                        strokeDashoffset: offset,
                        duration: 2.5,
                        ease: "custom", // Wait we need to register custom ease. Actually let's just use expo.out which is similar to the bezier
                        ease: "expo.out",
                        delay: 0.2
                    });
                },
                once: true
            });
        });

        return () => ctx.revert();
    }, [score]);

    return (
        <div id="eco-score-container" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative group">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 w-full text-left">Your Eco Score</h2>
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90 text-gray-100 dark:text-gray-800/80">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" />
                    {/* Animated Progress Circle */}
                    <circle
                        ref={circleRef}
                        cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                        strokeLinecap="round"
                        className="text-orange-400 transition-all drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-gray-900 dark:text-white">{currentScore}</span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">out of 100</span>
                </div>
            </div>
        </div>
    );
}

export default function Analytics() {
    const chartsRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [ecoScore, setEcoScore] = useState(0);
    const [wasteTypeData, setWasteTypeData] = useState([]);
    const [weeklyWaste, setWeeklyWaste] = useState([]);
    const [insightText, setInsightText] = useState("Start logging your waste to get personalized monthly insights!");

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/api/waste`, {
                    headers: { Authorization: token }
                });

                const logs = res.data;

                if (logs.length === 0) {
                    setLoading(false);
                    return;
                }

                // 1. Calculate Eco Score (Max 100 for gauge visualization)
                const totalPoints = logs.reduce((acc, log) => acc + (log.points || 0), 0);
                // Map points to a 0-100 scale. E.g., 500 points = 100 score. 
                const normalizedScore = Math.min(100, Math.round((totalPoints / 500) * 100));
                setEcoScore(normalizedScore > 0 ? normalizedScore : 5); // give at least 5 if they logged anything

                // 2. Calculate Waste Distribution (Pie Chart)
                const typeMap = {};
                let maxType = { type: '', count: 0 };

                logs.forEach(log => {
                    const type = log.type.toLowerCase();
                    typeMap[type] = (typeMap[type] || 0) + log.quantity;
                });

                const pieData = Object.keys(typeMap).map(key => {
                    if (typeMap[key] > maxType.count) {
                        maxType = { type: key, count: typeMap[key] };
                    }
                    return {
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value: typeMap[key]
                    };
                });
                setWasteTypeData(pieData);

                // Set dynamic insight based on max type
                if (maxType.type === 'plastic') {
                    setInsightText("You are generating a significant amount of plastic waste. Consider switching to reusable alternatives to boost your Eco Score! 🥤");
                } else if (maxType.type === 'organic') {
                    setInsightText("Great job separating organic waste! Starting a compost bin could turn this into valuable fertilizer. 🌱");
                } else {
                    setInsightText(`Keep up the good work! You're consistently tracking your ${maxType.type} waste and building better habits. 🌍`);
                }

                // 3. Calculate Weekly Breakdown (Bar Chart)
                // Simplified approach: bucket logs into 4 generic "weeks" based on timestamp
                // Real implementation might align strictly to calendar weeks
                const now = new Date();
                const weekBuckets = [
                    { name: 'Week 1', organic: 0, plastic: 0, paper: 0, metal: 0, glass: 0, 'e-waste': 0 },
                    { name: 'Week 2', organic: 0, plastic: 0, paper: 0, metal: 0, glass: 0, 'e-waste': 0 },
                    { name: 'Week 3', organic: 0, plastic: 0, paper: 0, metal: 0, glass: 0, 'e-waste': 0 },
                    { name: 'Week 4', organic: 0, plastic: 0, paper: 0, metal: 0, glass: 0, 'e-waste': 0 }
                ];

                logs.forEach(log => {
                    const logDate = new Date(log.date);
                    // Just simple modulo math to spread them across 4 buckets for the demo if logs are recent
                    // Or if all logs are same day, put them in week 4 to show "current" week

                    const timeDiff = now.getTime() - logDate.getTime();
                    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

                    let weekIndex = 3; // default to latest week
                    if (daysDiff > 21) weekIndex = 0;
                    else if (daysDiff > 14) weekIndex = 1;
                    else if (daysDiff > 7) weekIndex = 2;

                    const type = log.type.toLowerCase();
                    weekBuckets[weekIndex][type] = (weekBuckets[weekIndex][type] || 0) + log.quantity;
                });

                setWeeklyWaste(weekBuckets);
                setLoading(false);

            } catch (err) {
                console.error("Failed to fetch analytics data", err);
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);

    useEffect(() => {
        if (loading || wasteTypeData.length === 0) return;

        // Scrollytelling for Charts
        const ctx = gsap.context(() => {
            const bars = document.querySelectorAll('.recharts-bar-rectangle');
            const pies = document.querySelectorAll('.recharts-pie-sector');

            // Initial invisible state
            gsap.set(bars, { scaleY: 0, transformOrigin: 'bottom center' });
            gsap.set(pies, { scale: 0, transformOrigin: 'center center' });

            ScrollTrigger.create({
                trigger: chartsRef.current,
                start: "top 75%",
                onEnter: () => {
                    if (bars.length > 0) {
                        gsap.to(bars, {
                            scaleY: 1,
                            duration: 1.5,
                            stagger: 0.08,
                            ease: "expo.out"
                        });
                    }

                    if (pies.length > 0) {
                        gsap.to(pies, {
                            scale: 1,
                            duration: 1.5,
                            stagger: 0.1,
                            ease: "expo.out",
                            delay: 0.3
                        });
                    }
                },
                once: true
            });
        });

        return () => ctx.revert();
    }, [loading, wasteTypeData]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Waste Analytics 📊</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed breakdown of your waste generation and recycling habits over time.</p>
                </div>

                {wasteTypeData.length === 0 ? (
                    <div className="bg-white dark:bg-black/40 p-12 rounded-2xl text-center border border-gray-100 dark:border-white/5">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-orange-400 mb-2">No Data Available Yet</h2>
                        <p className="text-gray-500 dark:text-gray-400">Go to the Dashboard and log some waste to see your customized analytics!</p>
                    </div>
                ) : (
                    <>
                        <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Eco Score Gauge */}
                            <EcoScoreGauge score={ecoScore} />

                            {/* Monthly Trend - Bar Chart */}
                            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 lg:col-span-2 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -z-10"></div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-orange-400 mb-6">Monthly Waste Comparison (kg)</h2>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weeklyWaste}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', backdropFilter: 'blur(12px)' }}
                                            />
                                            <Legend iconType="circle" />
                                            <Bar dataKey="organic" stackId="a" fill={TYPE_COLORS['organic']} name="Organic" />
                                            <Bar dataKey="plastic" stackId="a" fill={TYPE_COLORS['plastic']} name="Plastic" />
                                            <Bar dataKey="paper" stackId="a" fill={TYPE_COLORS['paper']} name="Paper" />
                                            <Bar dataKey="metal" stackId="a" fill={TYPE_COLORS['metal']} name="Metal" />
                                            <Bar dataKey="glass" stackId="a" fill={TYPE_COLORS['glass']} name="Glass" />
                                            <Bar dataKey="e-waste" stackId="a" fill={TYPE_COLORS['e-waste']} name="E-Waste" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Waste Distribution - Pie Chart */}
                            <div className="bg-white dark:bg-black/40 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 lg:col-span-3">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-orange-400 mb-6">Waste Distribution</h2>
                                <div className="h-80 flex justify-center">
                                    <ResponsiveContainer width="100%" height="100%" maxWidth={600}>
                                        <PieChart>
                                            <Pie
                                                data={wasteTypeData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {wasteTypeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', backdropFilter: 'blur(12px)' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend iconType="circle" layout="vertical" verticalAlign="bottom" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-orange-950/20 dark:to-red-950/20 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-orange-500/20">
                            <h3 className="text-lg font-semibold text-indigo-900 dark:text-orange-400">Monthly Insight</h3>
                            <p className="text-indigo-800 dark:text-orange-100/70 mt-2">
                                {insightText}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </AnimatedPage>
    );
}