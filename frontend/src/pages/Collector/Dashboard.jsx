import { API_BASE_URL } from '../../apiConfig';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CheckCircle2, MapPin, Navigation, Clock, Truck } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import axios from 'axios';

export default function CollectorDashboard() {
    const [assigned, setAssigned] = useState([]);
    const [available, setAvailable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifyingMap, setNotifyingMap] = useState({});
    const [currentPos, setCurrentPos] = useState(null); // Real-time GPS location
    const [locationError, setLocationError] = useState(null);

    const token = localStorage.getItem('token');

    // Fetch real-time driver location
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            // Fallback to Noida if geolocation is completely unavailable
            setCurrentPos([28.5355, 77.3910]);
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setCurrentPos([position.coords.latitude, position.coords.longitude]);
                setLocationError(null);
            },
            (error) => {
                console.warn("Error getting location:", error.message);
                setLocationError("Waiting for GPS signal...");
                // Keep the last known position, or fallback to Noida area roughly if none
                if (!currentPos) {
                    setCurrentPos([28.5355, 77.3910]); // Noida fallback
                }
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    const fetchPickups = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/pickups`, {
                headers: { Authorization: token }
            });
            // Split into assigned manifest vs globally available pending pool
            const assignedData = res.data.filter(p => ['Assigned', 'Completed'].includes(p.status));
            const availableData = res.data.filter(p => p.status === 'Pending');
            setAssigned(assignedData);
            setAvailable(availableData);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch pickups", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPickups();
    }, [token]);

    const handleComplete = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/api/pickups/${id}/complete`, {}, {
                headers: { Authorization: token }
            });
            fetchPickups();
        } catch (err) {
            console.error("Failed to mark completed", err);
        }
    };

    const handleAccept = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/api/pickups/${id}/assign`, {}, {
                headers: { Authorization: token }
            });
            fetchPickups();
        } catch (err) {
            console.error("Failed to accept pickup", err);
            alert("Error accepting route.");
        }
    };

    const handleNotify = async (id) => {
        setNotifyingMap(prev => ({ ...prev, [id]: true }));
        try {
            await axios.post(`${API_BASE_URL}/api/pickups/${id}/notify`, {}, {
                headers: { Authorization: token }
            });
            alert("User has been notified successfully!");
        } catch (err) {
            console.error("Failed to notify user", err);
            alert("Failed to notify user.");
        } finally {
            setNotifyingMap(prev => ({ ...prev, [id]: false }));
        }
    };

    const activeRoutePickups = assigned.filter(p => p.status === 'Assigned');
    const completed = assigned.filter(p => p.status === 'Completed');

    // --- Smart Route Optimization (TSP Nearest Neighbor Algorithm) ---
    const getDistance = (p1, p2) => Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));

    const calculateOptimalRoute = (startPos, pickups) => {
        if (!startPos || pickups.length === 0) return { routeCoords: startPos ? [startPos] : [], optimizedPickups: [] };

        let unvisited = [...pickups];
        let currentPoint = startPos;
        let routeCoords = [startPos];
        let optimizedPickups = [];

        while (unvisited.length > 0) {
            let nearestIdx = 0;
            let minDistance = Infinity;
            let nearestCoords = null;

            for (let i = 0; i < unvisited.length; i++) {
                const p = unvisited[i];
                let coords = (p.coordinates && p.coordinates.lat)
                    ? [p.coordinates.lat, p.coordinates.lng]
                    : [routeCoords[routeCoords.length - 1][0] + 0.015, routeCoords[routeCoords.length - 1][1] + 0.02]; // Legacy fallback

                const dist = getDistance(currentPoint, coords);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestIdx = i;
                    nearestCoords = coords;
                }
            }

            optimizedPickups.push(unvisited[nearestIdx]);
            routeCoords.push(nearestCoords);
            currentPoint = nearestCoords;
            unvisited.splice(nearestIdx, 1);
        }

        return { routeCoords, optimizedPickups };
    };

    const { routeCoords: routeCoordinates, optimizedPickups } = calculateOptimalRoute(currentPos, activeRoutePickups);


    // Center the map on the truck
    const mapCenter = currentPos || [28.5355, 77.3910];

    if (loading || !currentPos) {
        return (
            <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Acquiring live GPS satellite lock...</p>
            </div>
        );
    }

    return (
        <AnimatedPage className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Manifest 🚛</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Your daily dispatched waste pickup route.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
                {/* Checklist View */}
                <div className="col-span-1 bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Truck className="w-5 h-5 text-blue-500" />
                            Pending Stops ({assigned.length})
                        </h2>
                    </div>

                    <div className="overflow-y-auto flex-1 p-4 space-y-4 no-scrollbar">
                        {optimizedPickups.length === 0 ? (
                            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20 text-green-500" />
                                All caught up for the day!
                            </div>
                        ) : optimizedPickups.map((pickup, index) => (
                            <div key={pickup._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500 opacity-10 blur-xl rounded-bl-full"></div>

                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                            {index + 1}
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">{pickup.wasteType} Pick-up</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500">
                                        {pickup.timeSlot.split(' ')[0]} {/* Quick hack to show just 'Morning' */}
                                    </span>
                                </div>

                                <div className="space-y-1.5 mt-3 relative z-10">
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <MapPin className="w-4 h-4 text-red-400 mt-0.5" />
                                        <span>{pickup.address}</span>
                                    </div>

                                    <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                                        <button
                                            onClick={() => {
                                                const coords = (pickup.coordinates && pickup.coordinates.lat)
                                                    ? `${pickup.coordinates.lat},${pickup.coordinates.lng}`
                                                    : pickup.address;
                                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}`, '_blank');
                                            }}
                                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <Navigation className="w-4 h-4" />
                                            Open in Maps
                                        </button>
                                        <button
                                            onClick={() => handleNotify(pickup._id)}
                                            disabled={notifyingMap[pickup._id]}
                                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-400 font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Clock className="w-4 h-4" />
                                            {notifyingMap[pickup._id] ? 'Notifying...' : 'Notify User Nearby'}
                                        </button>
                                        <button
                                            onClick={() => handleComplete(pickup._id)}
                                            className="w-full bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400 font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            Mark Collected
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {completed.length > 0 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-green-50/50 dark:bg-green-900/10">
                            <h3 className="text-sm font-bold text-green-800 dark:text-green-400 mb-2">Completed Today ({completed.length})</h3>
                            <div className="space-y-2">
                                {completed.slice(0, 3).map(p => (
                                    <div key={p._id} className="text-xs text-green-700 dark:text-green-500 flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span className="truncate">{p.address} ({p.wasteType})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Available Requests Pool */}
                <div className="col-span-1 bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-yellow-50/50 dark:bg-yellow-900/10">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Truck className="w-5 h-5 text-yellow-500" />
                            Available Requests ({available.length})
                        </h2>
                    </div>

                    <div className="overflow-y-auto flex-1 p-4 space-y-4 no-scrollbar">
                        {available.length === 0 ? (
                            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20 text-yellow-500" />
                                No pending requests available.
                            </div>
                        ) : available.map((pickup, index) => (
                            <div key={pickup._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-yellow-500 opacity-10 blur-xl rounded-bl-full"></div>

                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 dark:text-white">{pickup.wasteType} Pick-up</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500">
                                        {pickup.timeSlot.split(' ')[0]}
                                    </span>
                                </div>

                                <div className="space-y-1.5 mt-3 relative z-10">
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <MapPin className="w-4 h-4 text-red-400 mt-0.5" />
                                        <span>{pickup.address}</span>
                                    </div>

                                    <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                                        <button
                                            onClick={() => handleAccept(pickup._id)}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            Accept Route
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map View */}
                <div className="col-span-1 lg:col-span-2 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden relative z-0 flex flex-col">
                    <div className="bg-white/80 dark:bg-gray-900/80 p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-6 text-sm backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-medium">System State:</span>
                            <span className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> AI Optimal Routing Active
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-blue-500" />
                            <span className="text-gray-900 dark:text-white font-medium">{Math.max(0, routeCoordinates.length - 1)} Remaining Stops</span>
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        {locationError && (
                            <div className="absolute top-4 right-4 z-[400] bg-yellow-100 dark:bg-yellow-900/80 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg text-xs font-bold shadow-md">
                                {locationError}
                            </div>
                        )}
                        <MapContainer center={mapCenter} zoom={13} className="w-full h-full min-h-[400px]">
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                            {/* Line connecting points */}
                            {routeCoordinates.length > 1 && (
                                <Polyline
                                    positions={routeCoordinates}
                                    color="#10B981" // Emerald green to indicate optimized path
                                    weight={6}
                                    opacity={0.8}
                                    dashArray="10, 10" // Dashed line effect
                                />
                            )}

                            {/* Current Real-Time Truck Marker */}
                            {currentPos && (
                                <Marker position={currentPos}>
                                    <Popup><strong>You are here</strong><br />Live GPS Location</Popup>
                                </Marker>
                            )}

                            {/* Waypoint Markers */}
                            {optimizedPickups.map((stop, index) => {
                                const pos = routeCoordinates[index + 1];
                                return (
                                    <Marker key={stop._id} position={pos}>
                                        <Popup>
                                            <strong>Stop {index + 1}</strong><br />
                                            {stop.address}<br />
                                            <em>{stop.wasteType}</em>
                                        </Popup>
                                    </Marker>
                                )
                            })}
                        </MapContainer>
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
