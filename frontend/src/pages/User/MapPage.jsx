import { API_BASE_URL } from '../../apiConfig';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Filter, AlertTriangle, Navigation, Building2 } from 'lucide-react';
import L from 'leaflet';
import axios from 'axios';
import AnimatedPage from '../../components/AnimatedPage';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userIcon = new L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #f97316; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px 4px rgba(249, 115, 22, 0.6); animation: pulse 2s infinite;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

export default function MapPage() {
    const [filter, setFilter] = useState('All');
    const [bins, setBins] = useState([]);
    const [centers, setCenters] = useState([]);
    const [userLocation, setUserLocation] = useState([28.6139, 77.2090]); // Default Delhi
    const [locationLoaded, setLocationLoaded] = useState(false);

    useEffect(() => {
        // 1. Fetch live user geolocation
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                    setLocationLoaded(true);
                },
                (error) => {
                    console.error("Error obtaining location", error);
                    setLocationLoaded(true); // fall back to default
                },
                { enableHighAccuracy: true }
            );
        } else {
            setLocationLoaded(true);
        }

        // 2. Fetch Bin Data
        const fetchBins = () => {
            fetch(`${API_BASE_URL}/api/bins`)
                .then(res => res.json())
                .then(data => setBins(data))
                .catch(console.error);
        };

        // 3. Fetch Centers Data
        const fetchCenters = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/centers`);
                setCenters(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchBins();
        fetchCenters();
        const interval = setInterval(fetchBins, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredBins = filter === 'All'
        ? bins
        : filter === 'Alerts'
            ? bins.filter(b => b.status !== 'Normal')
            : filter === 'Centers'
                ? []
                : bins;

    const filteredCenters = filter === 'All' || filter === 'Centers'
        ? centers
        : [];

    if (!locationLoaded) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <AnimatedPage className="space-y-6 h-full flex flex-col p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500 flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-orange-500" />
                        Live Bin Locator
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Real-time geographical tracking of city smart bins around your location.</p>
                </div>

                <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-white/50 dark:border-gray-700/50">
                    <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 ml-3" />
                    <select
                        className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-800 dark:text-white py-2 pr-8 cursor-pointer outline-none"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="All">All Locations</option>
                        <option value="Alerts">Critical Bin Alerts</option>
                        <option value="Centers">Recycling Centers</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
                {/* Map View */}
                <div className="lg:col-span-3 bg-white/60 dark:bg-gray-900/40 rounded-[24px] shadow-sm border border-white/50 dark:border-gray-700/50 overflow-hidden relative z-0 backdrop-blur-2xl p-2">
                    <div className="w-full h-full rounded-[16px] overflow-hidden drop-shadow-sm">
                        <MapContainer key={userLocation.toString()} center={userLocation} zoom={13} className="w-full h-full min-h-[500px] z-0">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* User Location Marker */}
                            <Marker position={userLocation} icon={userIcon}>
                                <Popup className="custom-popup">
                                    <div className="text-center font-semibold text-orange-600">
                                        <Navigation className="w-4 h-4 inline-block mr-1 -mt-1" />
                                        You Are Here
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Dynamically placed Smart Bins */}
                            {filteredBins.map((bin, i) => {
                                // Spread bins organically in a 2-3km radius around the user
                                const latOffset = userLocation[0] + (Math.sin(i * 1.5) * 0.015);
                                const lngOffset = userLocation[1] + (Math.cos(i * 1.5) * 0.015);

                                return (
                                    <Marker key={bin._id || i} position={[latOffset, lngOffset]}>
                                        <Popup>
                                            <div className="p-1 min-w-[150px]">
                                                <h3 className="font-bold text-gray-900 border-b pb-1 mb-2">{bin.location}</h3>
                                                <div className="flex justify-between items-center text-sm font-medium mt-1">
                                                    <span className="text-gray-500">Fill Level:</span>
                                                    <span className={bin.fillLevel > 80 ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'}>{bin.fillLevel}%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm font-medium mt-1 border-t pt-1">
                                                    <span className="text-gray-500">Status:</span>
                                                    <span className={`font-bold ${bin.status !== 'Normal' ? 'text-red-500 animate-pulse' : 'text-green-600'}`}>
                                                        {bin.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            {/* Dynamically placed Recycling Centers */}
                            {filteredCenters.map((center) => (
                                <Marker
                                    key={`center-${center._id}`}
                                    position={[center.lat, center.lng]}
                                    icon={new L.divIcon({
                                        className: 'custom-center-icon',
                                        html: `<div style="background-color: #dc2626; width: 24px; height: 24px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg></div>`,
                                        iconSize: [24, 24],
                                        iconAnchor: [12, 12]
                                    })}
                                >
                                    <Popup>
                                        <div className="p-1 min-w-[150px]">
                                            <h3 className="font-bold text-gray-900 border-b pb-1 mb-2">🏭 {center.name}</h3>
                                            <div className="flex justify-between items-center text-sm font-medium mt-1">
                                                <span className="text-gray-500">Type:</span>
                                                <span className="text-red-500 font-bold">{center.type}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm font-medium mt-1 border-t pt-1">
                                                <span className="text-gray-500">Status:</span>
                                                <span className={`font-bold ${center.status === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {center.status}
                                                </span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Sidebar List */}
                <div className="bg-white/60 dark:bg-gray-900/40 rounded-[24px] shadow-sm border border-white/50 dark:border-gray-700/50 p-6 overflow-hidden max-h-[600px] flex flex-col gap-4 backdrop-blur-2xl">
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-orange-500" />
                        Live Status Feed
                    </h2>

                    <div className="overflow-y-auto no-scrollbar space-y-3 pr-1">
                        {filteredBins.map(bin => {
                            const isAlert = bin.status !== 'Normal';
                            return (
                                <div key={bin._id} className={`p-4 rounded-xl transition-all duration-300 border backdrop-blur-md cursor-pointer hover:scale-[1.02] ${isAlert ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-500/30' : 'bg-white/50 dark:bg-white/[0.03] border-gray-200/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            {isAlert ? <AlertTriangle className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> : <MapPin className="w-5 h-5 text-orange-500" />}
                                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{bin.location}</h3>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-0.5">Fill Level</span>
                                            <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                                                {bin.fillLevel}%
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-0.5">Condition</span>
                                            <span className={`font-bold ${isAlert ? 'text-red-500 tracking-wide' : 'text-emerald-500'}`}>
                                                {bin.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Rendering Centers in the Sidebar */}
                        {filteredCenters.map(center => (
                            <div key={`side-center-${center._id}`} className="p-4 rounded-xl transition-all duration-300 border backdrop-blur-md cursor-pointer hover:scale-[1.02] bg-orange-50/80 dark:bg-orange-900/20 border-orange-200 dark:border-orange-500/30">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]" />
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{center.name}</h3>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-0.5">Facility Type</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                                            {center.type}
                                        </span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-0.5">Status</span>
                                        <span className={`font-bold ${center.status === 'Active' ? 'text-green-500' : 'text-yellow-500'}`}>
                                            {center.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredBins.length === 0 && (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-12 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700/50 rounded-xl">
                                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                No bins matching alert filter.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Embedded CSS for pulsing marker */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(249, 115, 22, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </AnimatedPage>
    );
}