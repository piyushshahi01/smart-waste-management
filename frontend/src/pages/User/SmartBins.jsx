import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { db, ref, onValue } from "../../firebase";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Graph = ({ dataList }) => {
    const data = {
        labels: dataList.map((_, i) => {
            const date = new Date();
            date.setSeconds(date.getSeconds() - (dataList.length - 1 - i) * 5); // Approximate time
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }),
        datasets: [
            {
                label: "Fill Level %",
                data: dataList.map(d => d.fill || 0),
                borderColor: "#f97316", // orange-500
                backgroundColor: "rgba(249, 115, 22, 0.2)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "#ef4444", // red-500
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: "rgba(255, 255, 255, 0.7)" }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: "rgba(255, 255, 255, 0.1)" },
                ticks: { color: "rgba(255, 255, 255, 0.5)" }
            },
            x: {
                grid: { display: false },
                ticks: { color: "rgba(255, 255, 255, 0.5)" }
            }
        }
    };

    return <div className="h-64 w-full"><Line data={data} options={options} /></div>;
};

export default function SmartBins() {
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [notificationSent, setNotificationSent] = useState(false);

    useEffect(() => {
        // Check Notification permission
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        // Connect to Firebase Realtime Database
        // Listening to root or /bin depending on new structure. The user mentioned /bin/status, /bin/fill
        const dataRef = ref(db, "bin");

        // We also fallback to root / if bin is empty but bin1 has data. 
        // We'll just listen to root to be safe and parse it.
        const rootRef = ref(db, "/");

        const unsubscribe = onValue(rootRef, (snapshot) => {
            const value = snapshot.val();
            if (!value) return;

            let currentData = null;

            // Handle the new structure if they nested it under "bin"
            if (value.bin) {
                currentData = value.bin;
            }
            // Handle the old structure if it's "bin1"
            else if (value.bin1) {
                currentData = value.bin1;
            } else {
                currentData = value;
            }

            // Calculate fill locally if not provided by hardware (fallback)
            if (currentData.fill === undefined && currentData.distance !== undefined) {
                currentData.fill = Math.max(0, Math.min(100, ((13.0 - currentData.distance) / 13.0) * 100)); // Updated to 13cm height
            }

            setData(currentData);
            setHistory(prev => [...prev.slice(-19), currentData]); // keep last 20 values
        });

        return () => unsubscribe();
    }, []);

    // Notifications
    useEffect(() => {
        if (data && data.fill > 80 && !notificationSent) {
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("⚠️ Smart Bin Full!", {
                    body: `Bin fill level is at ${data.fill.toFixed(1)}%. Please collect ASAP.`,
                    icon: "/favicon.ico"
                });
            }
            setNotificationSent(true);
        } else if (data && data.fill <= 80) {
            setNotificationSent(false); // Reset when bin is emptied
        }
    }, [data, notificationSent]);

    const fillPercentage = data?.fill || 0;
    const isCritical = fillPercentage > 80;
    const statusColor = isCritical ? 'red' : (fillPercentage > 50 ? 'yellow' : 'green');

    return (
        <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                        <Icons.Trash2 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                        Smart Bin Monitoring
                    </h2>
                </div>

                {/* Live Status Indicator */}
                <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full border border-white/5">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </div>
                    <span className="text-sm font-medium text-green-400">Live Updates Active</span>
                </div>
            </div>

            {isCritical && (
                <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                    <div className="bg-red-500/20 p-2 rounded-full">
                        <Icons.AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h4 className="text-red-500 font-bold text-lg">⚠️ Bin is Full!</h4>
                        <p className="text-red-400/80 text-sm">Action required: Dispatch collector immediately to clear the bin.</p>
                    </div>
                </div>
            )}

            {data ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {/* Fill Level Card */}
                        <div className={`glass-panel p-6 rounded-2xl border ${isCritical ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10'} relative overflow-hidden group transition-all duration-300`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${statusColor}-500/20 to-${statusColor}-600/10 rounded-bl-full -z-10`} />
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-400 group-hover:text-white transition-colors">Fill Level</h3>
                                <Icons.Container className={`w-6 h-6 text-${statusColor}-400`} />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-white">
                                    {fillPercentage.toFixed(1)}%
                                </span>
                            </div>
                            <div className="mt-4 w-full bg-gray-800 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full bg-${statusColor}-500 transition-all duration-1000 ease-out`}
                                    style={{ width: `${fillPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Distance Card */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-400 group-hover:text-blue-400 transition-colors">Distance</h3>
                                <Icons.Ruler className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                                    {data.distance?.toFixed(2) || "N/A"}
                                </span>
                                <span className="text-gray-500 mb-1">cm</span>
                            </div>
                        </div>

                        {/* Temperature Card */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-orange-500/50 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-400 group-hover:text-orange-400 transition-colors">Temperature</h3>
                                <Icons.Thermometer className="w-6 h-6 text-orange-400" />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                                    {data.temp || "N/A"}
                                </span>
                                <span className="text-gray-500 mb-1">°C</span>
                            </div>
                        </div>

                        {/* Gas Level Card */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-yellow-500/50 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-400 group-hover:text-yellow-400 transition-colors">Gas Level</h3>
                                <Icons.CloudFog className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                                    {data.gas || "N/A"}
                                </span>
                                <span className="text-gray-500 mb-1">ppm</span>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Graph */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 w-full">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Icons.Activity className="w-5 h-5 text-orange-500" />
                            Fill Level Live Analytics
                        </h3>
                        {history.length > 0 ? (
                            <Graph dataList={history} />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                Collecting historical data...
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="glass-panel p-12 rounded-2xl border border-white/10 flex flex-col items-center justify-center h-64">
                    <Icons.Radio className="w-12 h-12 text-orange-500 animate-pulse mb-4" />
                    <p className="text-gray-400 text-lg">Listening for live IoT sensor data...</p>
                </div>
            )}
        </div>
    );
}
