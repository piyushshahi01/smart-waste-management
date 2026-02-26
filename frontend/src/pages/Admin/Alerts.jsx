import { API_BASE_URL } from '../../apiConfig';
import { AlertTriangle, Clock, CheckCircle, Search, Filter, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AnimatedPage from '../../components/AnimatedPage';

export default function AdminAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [newAlert, setNewAlert] = useState({ title: '', message: '', type: 'info', color: 'blue' });

    useEffect(() => {
        const fetchAlerts = () => {
            fetch(`${API_BASE_URL}/api/bins`)
                .then(res => res.json())
                .then(data => {
                    const filtered = data
                        .filter(bin => bin.status !== "Normal")
                        // Map the bin data to match the UI shape expected below
                        .map(bin => ({
                            id: bin.id || bin._id,
                            location: bin.location,
                            issue: bin.status,
                            priority: bin.status === 'Fire Risk' ? 'Critical' : bin.status === 'Gas Alert' ? 'High' : 'Medium',
                            status: 'Pending',
                            time: 'Just now'
                        }));
                    setAlerts(filtered);
                })
                .catch(err => console.error(err));
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000);
        return () => clearInterval(interval);
    }, []);

    const resolveAlert = (id) => {
        setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/alerts`, newAlert, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsPublishModalOpen(false);
            setNewAlert({ title: '', message: '', type: 'info', color: 'blue' });
            alert("Alert published successfully to all users!");
        } catch (err) {
            console.error(err);
            alert("Failed to publish alert");
        }
    };

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alert Management ⚠️</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Review and resolve system anomalies and citizen reports.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                    <div className="relative flex-1 min-w-[250px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search alerts..."
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                            <Filter className="w-5 h-5" />
                            Filter
                        </button>
                        <button
                            onClick={() => setIsPublishModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Publish Alert
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {alerts.map(alert => (
                        <div key={alert.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`p-3 rounded-full flex-shrink-0 ${alert.priority === 'Critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                    alert.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                    }`}>
                                    {alert.priority === 'Critical' ? <AlertTriangle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{alert.issue}</h3>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${alert.status === 'Resolved' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
                                            alert.status === 'In Progress' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                                                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                            }`}>
                                            {alert.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400">{alert.location}</p>
                                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> {alert.time}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {alert.status !== 'Resolved' && (
                                    <button
                                        onClick={() => resolveAlert(alert.id)}
                                        className="flex items-center gap-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg font-medium transition-colors border border-green-200 dark:border-green-800/50"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Mark Resolved
                                    </button>
                                )}
                                <button className="text-blue-600 dark:text-blue-400 font-medium px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                    Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Publish Alert Modal */}
            {isPublishModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Publish New Alert</h3>
                            <button onClick={() => setIsPublishModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handlePublish} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alert Title</label>
                                <input
                                    type="text" required
                                    value={newAlert.title}
                                    onChange={e => setNewAlert({ ...newAlert, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                <textarea required rows="3"
                                    value={newAlert.message}
                                    onChange={e => setNewAlert({ ...newAlert, message: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select
                                        value={newAlert.type}
                                        onChange={e => setNewAlert({ ...newAlert, type: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                    >
                                        <option value="info">Info</option>
                                        <option value="warning">Warning</option>
                                        <option value="critical">Critical</option>
                                        <option value="success">Success</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Theme</label>
                                    <select
                                        value={newAlert.color}
                                        onChange={e => setNewAlert({ ...newAlert, color: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                    >
                                        <option value="blue">Blue</option>
                                        <option value="yellow">Yellow</option>
                                        <option value="red">Red</option>
                                        <option value="green">Green</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsPublishModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                                    Publish Alert
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
}