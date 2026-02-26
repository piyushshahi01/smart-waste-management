import { API_BASE_URL } from '../../apiConfig';
import { AlertTriangle, Bell, Info, ShieldAlert, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AnimatedPage from '../../components/AnimatedPage';

export default function () {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/alerts`);
                setAlerts(res.data);
            } catch (err) {
                console.error("Failed to fetch alerts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'critical': return AlertTriangle;
            case 'warning': return ShieldAlert;
            case 'success': return Info;
            default: return Bell;
        }
    };

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            Notifications & Alerts 🔔
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Stay updated on bin statuses, pickup schedules, and community news.
                        </p>
                    </div>
                    <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                        Mark All as Read
                    </button>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No alerts yet</h3>
                            <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
                        </div>
                    ) : (
                        alerts.map((alert) => {
                            const Icon = getIcon(alert.type);
                            const colorStyles = {
                                red: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400',
                                yellow: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/50 text-yellow-600 dark:text-yellow-400',
                                blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400',
                                green: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400'
                            };

                            const formattedDate = new Date(alert.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                            return (
                                <div
                                    key={alert._id}
                                    className={`flex gap-4 p-5 rounded-2xl border ${alert.type === 'critical' ? 'border-red-200 dark:border-red-900 bg-white dark:bg-gray-800 shadow-sm' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'
                                        } transition-all hover:shadow-md cursor-pointer`}
                                >
                                    <div className={`p-3 rounded-full h-fit flex-shrink-0 ${colorStyles[alert.color] || colorStyles.blue}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg pr-4">{alert.title}</h3>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap pt-1 flex-shrink-0">{formattedDate}</span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                                            {alert.message}
                                        </p>
                                        {alert.type === 'critical' && (
                                            <button className="mt-3 text-sm font-bold text-red-600 dark:text-red-400 hover:underline">
                                                View Nearest Bins
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
}