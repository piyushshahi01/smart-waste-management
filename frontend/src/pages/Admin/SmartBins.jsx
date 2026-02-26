import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { db, ref, onValue } from "../../firebase";
import AnimatedPage from "../../components/AnimatedPage";

export default function SmartBins() {
    const [bins, setBins] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const rootRef = ref(db, "/");

        const unsubscribe = onValue(rootRef, (snapshot) => {
            const value = snapshot.val();
            if (value) {
                setBins(value);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getStatusColor = (fill) => {
        if (fill > 80) return "red";
        if (fill > 50) return "yellow";
        return "green";
    };

    const binEntries = Object.entries(bins);

    return (
        <AnimatedPage className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                        Fleet Smart Bin Monitoring 📶
                    </h2>
                    <p className="text-gray-400 mt-1">Live tracking for all hardware-connected bins in the network.</p>
                </div>

                <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full border border-white/5 shadow-lg">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </div>
                    <span className="text-sm font-medium text-green-400">Live Grid Active</span>
                </div>
            </div>

            {loading ? (
                <div className="glass-panel p-12 rounded-2xl border border-white/10 flex flex-col items-center justify-center h-64">
                    <Icons.Radio className="w-12 h-12 text-orange-500 animate-pulse mb-4" />
                    <p className="text-gray-400 text-lg">Initializing real-time fleet stream...</p>
                </div>
            ) : binEntries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {binEntries.map(([binId, data]) => {
                        const fill = data.fill || Math.max(0, Math.min(100, ((13.0 - data.distance) / 13.0) * 100));
                        const statusColor = getStatusColor(fill);
                        const isFull = fill > 80;

                        return (
                            <div
                                key={binId}
                                className={`glass-panel p-6 rounded-2xl border transition-all duration-500 relative overflow-hidden group hover:scale-[1.02] ${isFull ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10'
                                    }`}
                            >
                                {/* Background Liquid Visual */}
                                <div
                                    className={`absolute bottom-0 left-0 right-0 bg-${statusColor}-500/10 transition-all duration-1000 ease-out -z-10`}
                                    style={{ height: `${fill}%` }}
                                />

                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-${statusColor}-500/20`}>
                                            <Icons.Trash2 className={`w-5 h-5 text-${statusColor}-500`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{binId}</h3>
                                    </div>
                                    {isFull && (
                                        <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse">
                                            NEEDS PICKUP
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between text-xs font-medium mb-1.5 px-0.5">
                                            <span className="text-gray-400">Current Capacity</span>
                                            <span className={`text-${statusColor}-400 font-bold`}>{fill.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5 p-[2px]">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r from-${statusColor}-500 to-${statusColor}-400 shadow-[0_0_10px_rgba(var(--tw-gradient-from),0.5)] transition-all duration-1000 ease-out`}
                                                style={{ width: `${fill}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-sm group-hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icons.Thermometer className="w-4 h-4 text-orange-400" />
                                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Temp</span>
                                            </div>
                                            <p className="text-lg font-bold text-white">{data.temp || "--"}°C</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-sm group-hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icons.CloudFog className="w-4 h-4 text-purple-400" />
                                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Gas</span>
                                            </div>
                                            <p className="text-lg font-bold text-white">{data.gas || "--"} ppm</p>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-black/20 p-2 rounded-lg border border-white/5">
                                            <Icons.MapPin className="w-3.5 h-3.5" />
                                            <span className="truncate">{data.location || "Central Facility Area"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-panel p-20 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
                    <Icons.PackageX className="w-16 h-16 text-gray-700 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-400 mb-2">No Active Smart Bins</h3>
                    <p className="text-gray-500 max-w-md">The system is ready, but no hardware modules have reported data yet. Connect a bin to see it appear here.</p>
                </div>
            )}
        </AnimatedPage>
    );
}