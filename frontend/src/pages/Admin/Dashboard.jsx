import { API_BASE_URL } from '../../apiConfig';
import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import axios from 'axios';
import { Trash2, TrendingUp, AlertTriangle } from 'lucide-react';
import { db, ref, onValue } from '../../firebase';


export default function AdminDashboard() {
    const [weeklyData, setWeeklyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [weeklyRes, monthlyRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/analytics/weekly`),
                    axios.get(`${API_BASE_URL}/api/analytics/monthly`)
                ]);

                // Map data to readable labels
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const mappedWeekly = weeklyRes.data.map(d => ({
                    name: days[d._id - 1] || 'Unknown',
                    waste: d.total
                }));
                setWeeklyData(mappedWeekly);

                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const mappedMonthly = monthlyRes.data.map(d => ({
                    name: months[d._id - 1] || 'Unknown',
                    waste: d.total
                }));
                setMonthlyData(mappedMonthly);

            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Real-time Firebase listener for bins
        const binsRef = ref(db, "/");
        const unsubscribe = onValue(binsRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            const binsList = [];
            // Handle different possible structures (root with bin1, bin2 OR /bin/bin1, bin2)
            const source = data.bin || data;

            for (const key in source) {
                if (key.startsWith('bin') || source[key].location) {
                    const binData = source[key];
                    // Calculate fill level if not provided
                    const fillLevel = binData.fill !== undefined
                        ? binData.fill
                        : (binData.distance !== undefined
                            ? Math.max(0, Math.min(100, ((13.0 - binData.distance) / 13.0) * 100))
                            : 0);

                    let status = binData.status || "Normal";
                    if (fillLevel > 80) status = "Full";
                    if (binData.gas > 500) status = "Gas Alert";
                    if (binData.temp > 40) status = "Fire Risk";

                    binsList.push({
                        ...binData,
                        id: key,
                        fillLevel,
                        status
                    });
                }
            }
            setBins(binsList);
        });

        return () => unsubscribe();
    }, []);


    const totalBins = bins.length;
    const fullBins = bins.filter(b => b.fillLevel > 80).length;
    const dangerBins = bins.filter(b => b.status !== "Normal").length;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">
                Command Center Overview
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl hover:bg-white/10 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-4 text-cyan-400 mb-2">
                        <Trash2 className="w-6 h-6" />
                        <h3 className="font-semibold text-gray-300">Total Waste Logged</h3>
                    </div>
                    <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500 text-shadow-sm">
                        {weeklyData.reduce((acc, curr) => acc + curr.waste, 0)} kg
                    </p>
                    <p className="text-sm text-gray-400 mt-2">This week</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl backdrop-blur-xl hover:bg-blue-500/20 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-4 text-blue-400 mb-2">
                        <Trash2 className="w-6 h-6" />
                        <h3 className="font-semibold text-gray-300">Total Bins</h3>
                    </div>
                    <p className="text-4xl font-bold text-white text-shadow-sm">
                        {totalBins}
                    </p>
                    <p className="text-sm text-blue-300 mt-2">Active units</p>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-2xl backdrop-blur-xl hover:bg-purple-500/20 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-4 text-purple-400 mb-2">
                        <TrendingUp className="w-6 h-6" />
                        <h3 className="font-semibold text-gray-300">Full Bins</h3>
                    </div>
                    <p className="text-4xl font-bold text-white text-shadow-sm">
                        {fullBins}
                    </p>
                    <p className="text-sm text-purple-300 mt-2">&gt;80% Capacity</p>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl backdrop-blur-xl hover:bg-red-500/20 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-4 text-red-500 mb-2">
                        <AlertTriangle className="w-6 h-6" />
                        <h3 className="font-semibold text-gray-300">Alerts</h3>
                    </div>
                    <p className="text-4xl font-bold text-white text-shadow-sm">
                        {dangerBins}
                    </p>
                    <p className="text-sm text-red-400 mt-2">Requires attention</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-gray-500">Loading graphs...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Graph */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                        <h3 className="text-xl font-semibold mb-6 text-gray-200">Weekly Collection</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888" tickLine={false} />
                                    <YAxis stroke="#888" tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', backdropFilter: 'blur(12px)' }}
                                    />
                                    <Bar dataKey="waste" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly Graph */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                        <h3 className="text-xl font-semibold mb-6 text-gray-200">Monthly Trends</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888" tickLine={false} />
                                    <YAxis stroke="#888" tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', backdropFilter: 'blur(12px)' }}
                                    />
                                    <Line type="monotone" dataKey="waste" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}