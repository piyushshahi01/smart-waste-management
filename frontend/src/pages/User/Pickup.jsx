import { API_BASE_URL } from '../../apiConfig';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Truck, CheckCircle2, AlertCircle, Clock, Navigation } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import axios from 'axios';

export default function Pickup() {
    const [submitted, setSubmitted] = useState(false);
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [formData, setFormData] = useState({
        wasteType: 'General',
        address: '',
        date: '',
        timeSlot: 'Morning (8AM - 12PM)',
        coordinates: null
    });

    const token = localStorage.getItem('token');

    const fetchPickups = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/pickups`, {
                headers: { Authorization: token }
            });
            setPickups(res.data);
        } catch (err) {
            console.error("Failed to fetch pickups", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPickups();
    }, [token]);

    // Nominatim Autocomplete
    useEffect(() => {
        if (formData.address.length > 4 && showSuggestions) {
            const delayDebounceFn = setTimeout(async () => {
                try {
                    // Use fetch without credentials to avoid global interceptors triggering CORS preflight OPTIONS requests on Nominatim
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=5`);
                    if (!res.ok) throw new Error('Network response was not ok');
                    const data = await res.json();
                    setSuggestions(data);
                } catch (err) {
                    console.error("Autocomplete error:", err);
                }
            }, 600);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setSuggestions([]);
        }
    }, [formData.address, showSuggestions]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/pickups`, formData, {
                headers: { Authorization: token }
            });

            setSubmitted(true);
            fetchPickups(); // Refresh the list

            setTimeout(() => {
                setSubmitted(false);
                setFormData({ wasteType: 'General', address: '', date: '', timeSlot: 'Morning (8AM - 12PM)', coordinates: null });
            }, 3000);

        } catch (err) {
            console.error("Failed to schedule pickup", err);
            alert("Error scheduling pickup. Please try again.");
        }
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Use native fetch to avoid CORS preflight caused by axios global headers
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    if (!res.ok) throw new Error('Network response was not ok');
                    const data = await res.json();

                    setFormData(prev => ({
                        ...prev,
                        address: data.display_name,
                        coordinates: { lat: latitude, lng: longitude }
                    }));
                } catch (err) {
                    console.error("Reverse geocoding failed", err);
                    alert("Failed to grab address from coordinates.");
                } finally {
                    setIsDetectingLocation(false);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                alert("Failed to get current location. Please allow location access.");
                setIsDetectingLocation(false);
            }
        );
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this pickup request?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/pickups/${id}`, {
                headers: { Authorization: token }
            });
            fetchPickups(); // Refresh the list
        } catch (err) {
            console.error("Failed to cancel pickup", err);
            alert(err.response?.data?.msg || "Error cancelling pickup.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
                        Schedule Waste Pickup <Truck className="w-8 h-8 text-blue-500" />
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                        Request a special pickup for bulky items, e-waste, or large quantities of recyclables directly from your location.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-3 bg-white/60 dark:bg-gray-900/40 backdrop-blur-2xl rounded-3xl shadow-sm border border-white/50 dark:border-gray-700/50 overflow-hidden relative z-0">
                        {submitted ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-300">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pickup Scheduled!</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Your request for {formData.wasteType} waste pickup has been confirmed for {new Date(formData.date).toLocaleDateString()}.
                                </p>
                                <p className="text-gray-500 text-sm mt-4">You will receive a notification when the truck is tracking nearby.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Waste Type */}
                                <div>
                                    <label className="block text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 mb-3 uppercase">
                                        Type of Waste
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['General', 'E-Waste', 'Furniture', 'Construction'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${formData.wasteType === type
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                    : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                                                    }`}
                                                onClick={() => setFormData({ ...formData, wasteType: type })}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label htmlFor="address" className="block text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">
                                            Pickup Address
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleDetectLocation}
                                            disabled={isDetectingLocation}
                                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                                        >
                                            {isDetectingLocation ? (
                                                <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></span>
                                            ) : (
                                                <Navigation className="w-3 h-3" />
                                            )}
                                            {isDetectingLocation ? 'Detecting...' : 'Use Current Location'}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="address"
                                            id="address"
                                            required
                                            autoComplete="off"
                                            className="pl-11 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium relative z-20"
                                            placeholder="123 Main St, Apartment 4B"
                                            value={formData.address}
                                            onChange={(e) => {
                                                setShowSuggestions(true);
                                                handleChange(e);
                                            }}
                                        />

                                        {/* Autocomplete Dropdown */}
                                        {showSuggestions && suggestions.length > 0 && (
                                            <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-auto">
                                                {suggestions.map((item, index) => (
                                                    <li
                                                        key={index}
                                                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700/50 last:border-none"
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                address: item.display_name,
                                                                coordinates: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) }
                                                            });
                                                            setShowSuggestions(false);
                                                        }}
                                                    >
                                                        {item.display_name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="date" className="block text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 mb-3 uppercase">
                                            Preferred Date
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="date"
                                                name="date"
                                                id="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                className="pl-11 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                                                value={formData.date}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 mb-3 uppercase">
                                            Time Slot
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Clock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <select
                                                name="timeSlot"
                                                required
                                                className="pl-11 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all font-medium cursor-pointer"
                                                value={formData.timeSlot}
                                                onChange={handleChange}
                                            >
                                                <option>Morning (8AM - 12PM)</option>
                                                <option>Afternoon (12PM - 4PM)</option>
                                                <option>Evening (4PM - 8PM)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-4 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(37,99,235,0.3)] mt-8 flex items-center justify-center gap-2"
                                >
                                    <Truck className="w-5 h-5" />
                                    Book Collection Slot
                                </button>
                            </form>
                        )}
                    </div>

                    {/* History Section */}
                    <div className="lg:col-span-2 bg-white/60 dark:bg-gray-900/40 backdrop-blur-2xl rounded-3xl shadow-sm border border-white/50 dark:border-gray-700/50 p-6 flex flex-col h-[600px]">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                            Your Active Requests
                        </h2>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : pickups.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No active pickup requests.</p>
                                </div>
                            ) : (
                                pickups.map(request => (
                                    <div key={request._id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-transform hover:-translate-y-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {new Date(request.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {request.wasteType} Waste
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5" />
                                                {request.timeSlot}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500 flex items-start gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                                <MapPin className="w-3.5 h-3.5 mt-0.5 text-blue-500 shrink-0" />
                                                <span className="truncate" title={request.address}>
                                                    {request.address}
                                                </span>
                                            </p>
                                        </div>

                                        {request.status === 'Pending' && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-end">
                                                <button
                                                    onClick={() => handleCancel(request._id)}
                                                    className="text-xs font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    Cancel Booking
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
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