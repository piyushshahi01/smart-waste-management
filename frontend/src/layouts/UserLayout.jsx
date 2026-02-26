import { API_BASE_URL } from '../apiConfig';
import { useState, useEffect } from "react";
import axios from "axios";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const userLinks = [
    { name: "Dashboard", path: "/user/dashboard", icon: "LayoutDashboard" },
    { name: "Smart Bins", path: "/user/smart-bins", icon: "Trash2" },
    { name: "Map", path: "/user/map", icon: "Map" },
    { name: "AI Detection", path: "/user/ai-detection", icon: "Scan" },
    { name: "Pickup", path: "/user/pickup", icon: "Truck" },
    { name: "Analytics", path: "/user/analytics", icon: "BarChart2" },
    { name: "Suggestions", path: "/user/suggestions", icon: "Lightbulb" },
    { name: "Alerts", path: "/user/alerts", icon: "Bell" },
    { name: "Rewards", path: "/user/rewards", icon: "Gift" },
    { name: "Impact Report", path: "/user/impact", icon: "TrendingUp" },
    { name: "Profile", path: "/user/profile", icon: "User" }
];

export default function UserLayout() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const [level, setLevel] = useState(1);

    useEffect(() => {
        if (token) {
            axios.get(`${API_BASE_URL}/api/auth/me`, {
                headers: { Authorization: token }
            }).then(res => {
                const pts = res.data.ecoPoints || 0;
                setLevel(Math.floor(pts / 100) + 1);
            }).catch(err => console.error("Could not fetch user level", err));
        }
    }, [token]);

    if (!token) return <Navigate to="/login" replace />;
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "collector") return <Navigate to="/collector/dashboard" replace />;

    const bgClass = `bg-level-${level > 4 ? 4 : level}`;

    return (
        <div className="flex h-screen text-white overflow-hidden relative">
            <div className={`bg-animation ${bgClass}`}></div>
            <Sidebar title="User Panel" links={userLinks} />
            <div className="flex-1 overflow-y-auto relative z-10 flex flex-col">
                {/* Mobile Header Toggle */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
                    <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">WasteSync</h1>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-sidebar'))}
                        className="p-2 rounded-lg bg-white/5 border border-white/10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>

                <main className="flex-1 w-full max-w-full">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
}
