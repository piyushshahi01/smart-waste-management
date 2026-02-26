import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Navigation, Menu, Truck } from "lucide-react";
import { useState } from "react";
import Footer from "../components/Footer";

export default function CollectorLayout() {
    const role = localStorage.getItem("role");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    if (role !== "collector") {
        return <Navigate to="/login" />;
    }

    const navigation = [
        { name: "My Routes", icon: Navigation, path: "/collector/dashboard" }
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-gray-50/50 dark:bg-gray-950 overflow-hidden">
            <aside className={`fixed inset-y-0 left-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 w-64 transform transition-transform duration-300 ease-in-out z-20 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
                <div className="flex flex-col h-full bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50">
                    <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md bg-white/50 dark:bg-gray-900/50">
                        <Truck className="h-8 w-8 text-orange-600 dark:text-orange-500" />
                        <span className="ml-3 text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">EcoDriverFleet</span>
                    </div>

                    <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                        ? "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                    {item.name}
                                </button>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-300">
                <header className="h-16 lg:hidden flex justify-between items-center px-4 sm:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 z-10 sticky top-0">
                    <div className="flex items-center">
                        <Truck className="h-8 w-8 text-orange-600 pr-2" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">EcoDriverFleet</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 -mr-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto w-full relative scroll-smooth flex flex-col">
                    <div className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
                        <Outlet />
                    </div>
                    <Footer />
                </main>
            </div>
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-10 md:hidden animate-in fade-in duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
