import { API_BASE_URL } from '../../apiConfig';
import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Heatmap() {
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBins = () => {
            fetch(`${API_BASE_URL}/api/bins`, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            })
                .then(res => res.json())
                .then(data => {
                    setBins(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        };
        fetchBins();

        const interval = setInterval(fetchBins, 5000);
        return () => clearInterval(interval);
    }, []);

    const mapCenter = [28.5355, 77.3910]; // Default NOIDA coordinates

    return (
        <AnimatedPage className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Waste Heatmap 🔥</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Identify high-waste generation areas for optimized resource allocation.</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="text-gray-600 dark:text-gray-300 font-medium">High</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Medium</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Low</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[500px]">
                {/* Map View */}
                <div className="lg:col-span-3 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 relative z-0 flex flex-col overflow-hidden">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500">Loading map data...</div>
                    ) : (
                        <MapContainer center={mapCenter} zoom={13} className="w-full h-full min-h-[500px]">
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                            {bins.map((bin) => {
                                // Default coordinates fallback if DB lacks them
                                const lat = bin.coordinates?.lat || (mapCenter[0] + (Math.random() - 0.5) * 0.1);
                                const lng = bin.coordinates?.lng || (mapCenter[1] + (Math.random() - 0.5) * 0.1);

                                let color = "#22c55e"; // Green
                                let radius = 15;
                                if (bin.fillLevel > 80) { color = "#ef4444"; radius = 35; } // Red
                                else if (bin.fillLevel > 50) { color = "#eab308"; radius = 25; } // Yellow

                                return (
                                    <CircleMarker
                                        key={bin._id}
                                        center={[lat, lng]}
                                        pathOptions={{ fillColor: color, color: color, weight: 2, fillOpacity: 0.4 }}
                                        radius={radius}
                                    >
                                        <Popup>
                                            <strong>{bin.location}</strong><br />
                                            Fill Level: {bin.fillLevel}%<br />
                                            Last Updated: {new Date(bin.lastUpdated).toLocaleTimeString()}
                                        </Popup>
                                    </CircleMarker>
                                );
                            })}
                        </MapContainer>
                    )}
                </div>

                {/* Sidebar Insights */}
                <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-5 border border-red-200 dark:border-red-900/50">
                        {(() => {
                            const criticalBin = bins.find(b => b.fillLevel > 80);
                            if (criticalBin) {
                                return (
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-red-800 dark:text-red-400">Critical Area Alert</h3>
                                            <p className="text-sm text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                                                {criticalBin.location} is showing a {criticalBin.fillLevel}% fill level. Suggest deploying an extra truck.
                                            </p>
                                            <button className="mt-3 text-sm font-bold bg-white dark:bg-red-950 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg shadow-sm w-full hover:bg-red-50 dark:hover:bg-red-900 transition-colors border border-red-100 dark:border-red-800">
                                                Optimize Route Now
                                            </button>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-green-800 dark:text-green-400">All Areas Optimal</h3>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-1 leading-relaxed">
                                                Waste generation is within normal limits across all zones.
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                        })()}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Top Generating Zones</h2>
                        <div className="space-y-4">
                            {[...bins].sort((a, b) => b.fillLevel - a.fillLevel).slice(0, 4).map((bin, i) => (
                                <div key={bin._id || i} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-400 dark:text-gray-500 w-4">{i + 1}.</span>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1 truncate w-24 sm:w-32">{bin.location}</span>
                                    </div>
                                    <span className={`text-sm font-bold ${bin.fillLevel > 80 ? 'text-red-500' : bin.fillLevel > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                                        {bin.fillLevel}% Full
                                    </span>
                                </div>
                            ))}
                            {bins.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Waiting for live data...</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}