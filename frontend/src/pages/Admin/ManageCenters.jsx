import { API_BASE_URL } from '../../apiConfig';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Search, X, Loader2, Navigation } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AnimatedPage from '../../components/AnimatedPage';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ManageCenters() {
    const [centers, setCenters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCenter, setEditingCenter] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'Plastic', lat: '', lng: '', status: 'Active' });

    // Component to handle map clicks
    function LocationMarker() {
        useMapEvents({
            click(e) {
                setFormData(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
            },
        });

        return formData.lat && formData.lng ? (
            <Marker position={[formData.lat, formData.lng]}>
                <Popup>Selected Location</Popup>
            </Marker>
        ) : null;
    }

    useEffect(() => {
        fetchCenters();
    }, []);

    const fetchCenters = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/centers`);
            setCenters(res.data);
        } catch (err) {
            console.error("Failed to fetch centers", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this center?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/centers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCenters();
        } catch (err) {
            console.error("Failed to delete center", err);
            alert("Failed to delete center");
        }
    };

    const handleOpenModal = (center = null) => {
        if (center) {
            setEditingCenter(center);
            setFormData({ name: center.name, type: center.type, lat: center.lat, lng: center.lng, status: center.status || 'Active' });
        } else {
            setEditingCenter(null);
            setFormData({ name: '', type: 'Plastic', lat: '', lng: '', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = { ...formData, lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) };

            if (editingCenter) {
                await axios.put(`${API_BASE_URL}/api/centers/${editingCenter._id}`, payload, config);
            } else {
                await axios.post(`${API_BASE_URL}/api/centers`, payload, config);
            }
            setIsModalOpen(false);
            fetchCenters();
        } catch (err) {
            console.error("Failed to save center", err);
            alert("Failed to save center. Ensure you have admin privileges.");
        }
    };

    const filteredCenters = centers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Recycling Centers 🏢</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Add, update, or remove recycling facilities from the network.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    Add New Center
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search centers by name or type..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="font-semibold py-4 px-6">Name</th>
                                <th className="font-semibold py-4 px-6">Type</th>
                                <th className="font-semibold py-4 px-6">Location (Lat, Lng)</th>
                                <th className="font-semibold py-4 px-6">Status</th>
                                <th className="font-semibold py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                                    </td>
                                </tr>
                            ) : filteredCenters.map(center => (
                                <tr key={center._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            {center.name}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                                            {center.type}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-mono text-sm">
                                        {center.lat}, {center.lng}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 w-fit ${center.status === 'Active'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${center.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                            {center.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(center)}
                                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(center._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredCenters.length === 0 && !loading && (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            No recycling centers found matching your search.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Add / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {editingCenter ? 'Edit Center' : 'Add New Center'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Center Name</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                    >
                                        <option value="Plastic">Plastic</option>
                                        <option value="Paper">Paper</option>
                                        <option value="E-Waste">E-Waste</option>
                                        <option value="Organic">Organic</option>
                                        <option value="Glass">Glass</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location (Click on the map to set)</label>
                                <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative z-0">
                                    <MapContainer
                                        center={formData.lat ? [formData.lat, formData.lng] : [28.6139, 77.2090]}
                                        zoom={11}
                                        className="h-full w-full"
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <LocationMarker />
                                    </MapContainer>
                                </div>
                                <div className="flex gap-4 mt-3">
                                    <div className="flex-1">
                                        <span className="text-xs text-gray-500 block mb-1">Latitude</span>
                                        <input
                                            type="number" step="any" required readOnly
                                            value={formData.lat}
                                            placeholder="Click map"
                                            className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-gray-300 font-mono text-sm cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs text-gray-500 block mb-1">Longitude</span>
                                        <input
                                            type="number" step="any" required readOnly
                                            value={formData.lng}
                                            placeholder="Click map"
                                            className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-gray-300 font-mono text-sm cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50">
                                    {editingCenter ? 'Save Changes' : 'Create Center'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
}