import { API_BASE_URL } from '../../apiConfig';
import { useState, useEffect } from 'react';
import { Truck, Navigation, CheckCircle2, AlertTriangle, Clock, MapPin, User as UserIcon } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import axios from 'axios';

export default function RoutesPage() {
    const [pickups, setPickups] = useState([]);
    const [collectors, setCollectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [selectedCollectorId, setSelectedCollectorId] = useState('');

    const token = localStorage.getItem('token');

    const fetchData = async () => {
        try {
            const [pickupRes, colRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/pickups`, { headers: { Authorization: token } }),
                axios.get(`${API_BASE_URL}/api/auth/collectors`)
            ]);
            setPickups(pickupRes.data);
            setCollectors(colRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch dispatch data:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleAssign = async () => {
        if (!selectedPickup || !selectedCollectorId) return;

        try {
            await axios.put(`${API_BASE_URL}/api/pickups/${selectedPickup._id}/assign`,
                { collectorId: selectedCollectorId },
                { headers: { Authorization: token } }
            );

            // Refresh lists
            setSelectedPickup(null);
            setSelectedCollectorId('');
            fetchData();
        } catch (err) {
            console.error("Error assigning collector", err);
            alert("Failed to assign collector.");
        }
    };

    const pendingPickups = pickups.filter(p => p.status === 'Pending');
    const activePickups = pickups.filter(p => p.status === 'Assigned' || p.status === 'Completed');

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <AnimatedPage className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dispatch Center 📡</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Review user pickup requests and route them to your active field fleets.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 flex-1">
                {/* Pending Requests Column (col-span-1) */}
                <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-sm border border-yellow-200 dark:border-yellow-900/50 flex flex-col h-[700px] overflow-hidden">
                    <div className="p-4 border-b border-yellow-100 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/20">
                        <h2 className="font-semibold text-yellow-900 dark:text-yellow-400 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Pending Dispatch ({pendingPickups.length})
                        </h2>
                    </div>

                    <div className="overflow-y-auto flex-1 p-4 space-y-4 no-scrollbar">
                        {pendingPickups.length === 0 ? (
                            <div className="text-center text-gray-400 mt-10 text-sm">No pending requests.</div>
                        ) : (
                            pendingPickups.map(pickup => (
                                <div
                                    key={pickup._id}
                                    onClick={() => setSelectedPickup(pickup)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedPickup?._id === pickup._id
                                        ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-400 dark:border-blue-500 shadow-md transform scale-[1.02]'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xl text-gray-900 dark:text-white">{pickup.wasteType}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-500">
                                            {new Date(pickup.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-gray-400" />
                                            {pickup.userId?.name || 'Unknown User'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            {pickup.timeSlot}
                                        </div>
                                        <div className="flex items-start justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-start gap-2 pr-2">
                                                <MapPin className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                                <span className="line-clamp-2">{pickup.address}</span>
                                            </div>
                                            {pickup.coordinates?.lat && pickup.coordinates?.lng && (
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${pickup.coordinates.lat},${pickup.coordinates.lng}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="shrink-0 text-xs font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded"
                                                >
                                                    Map ↗
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {selectedPickup?._id === pickup._id && (
                                        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-2">Assign to Fleet</label>
                                            <div className="flex gap-2">
                                                <select
                                                    className="flex-1 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={selectedCollectorId}
                                                    onChange={(e) => setSelectedCollectorId(e.target.value)}
                                                >
                                                    <option value="" disabled>Select a Driver...</option>
                                                    {collectors.map(c => (
                                                        <option key={c._id} value={c._id}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleAssign(); }}
                                                    disabled={!selectedCollectorId}
                                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                                >
                                                    Dispatch
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Live Active Fleets Column (col-span-1) */}
                <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-sm border border-emerald-200 dark:border-emerald-900/50 flex flex-col h-[700px] overflow-hidden">
                    <div className="p-4 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20">
                        <h2 className="font-semibold text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            Active Fleets ({collectors.length})
                        </h2>
                    </div>

                    <div className="overflow-y-auto flex-1 p-4 space-y-4 no-scrollbar">
                        {collectors.length === 0 ? (
                            <div className="text-center text-gray-400 mt-10 text-sm">No drivers online.</div>
                        ) : (
                            collectors.map(driver => {
                                const activeJobs = activePickups.filter(p => p.assignedCollectorId?._id === driver._id && p.status === 'Assigned');

                                return (
                                    <div
                                        key={driver._id}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                                                    {driver.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-900 dark:text-white block">{driver.name}</span>
                                                    <span className="text-xs text-gray-500 font-mono tracking-wider">{driver.vehicleNumber || 'No Plate'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Online
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs">
                                            <span className="font-semibold text-gray-500">Current Load:</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400">{activeJobs.length} Assigned {activeJobs.length === 1 ? 'Stop' : 'Stops'}</span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Active Tracking Column (col-span-2) */}
                <div className="xl:col-span-2 bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-sm border border-blue-200 dark:border-blue-900/50 flex flex-col h-[700px] overflow-hidden">
                    <div className="p-4 border-b border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20">
                        <h2 className="font-semibold text-blue-900 dark:text-blue-400 flex items-center gap-2">
                            <Navigation className="w-5 h-5" />
                            Active & Completed Routes
                        </h2>
                    </div>

                    <div className="overflow-y-auto flex-1 p-6 no-scrollbar">
                        {activePickups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                                <Truck className="w-16 h-16 opacity-20" />
                                <p>No fleets currently assigned to active pick-ups.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activePickups.map(pickup => (
                                    <div key={pickup._id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                                        <div className={`absolute top-0 right-0 w-16 h-16 ${pickup.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'} opacity-10 blur-2xl rounded-bl-full transition-all group-hover:scale-150`}></div>

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 ${pickup.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                                                {pickup.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                                                {pickup.status.toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">{new Date(pickup.date).toLocaleDateString()}</span>
                                        </div>

                                        <div className="space-y-3 relative z-10">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-0.5">Assigned To</p>
                                                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">
                                                        {pickup.assignedCollectorId?.name?.charAt(0) || '?'}
                                                    </div>
                                                    Driver: {pickup.assignedCollectorId?.name || 'Unknown'}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Waste Profile</p>
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{pickup.wasteType}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Time Window</p>
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{pickup.timeSlot}</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl mt-2 flex justify-between items-start gap-2">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{pickup.address}</p>
                                                </div>
                                                {pickup.coordinates?.lat && pickup.coordinates?.lng && (
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${pickup.coordinates.lat},${pickup.coordinates.lng}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="shrink-0 text-[10px] font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded uppercase tracking-wider"
                                                    >
                                                        Live Map ↗
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </AnimatedPage>
    );
}