import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "LayoutDashboard" },
    { name: "Manage Centers", path: "/admin/manage-centers", icon: "Settings" },
    { name: "Smart Bins", path: "/admin/smart-bins", icon: "Trash2" },
    { name: "Routes", path: "/admin/routes", icon: "Map" },
    { name: "Reports", path: "/admin/reports", icon: "FileText" },
    { name: "Heatmap", path: "/admin/heatmap", icon: "MapPin" },
    { name: "Alerts", path: "/admin/alerts", icon: "Bell" }
];

export default function AdminLayout() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) return <Navigate to="/login" replace />;
    if (role !== "admin") return <Navigate to="/user/dashboard" replace />;

    return (
        <div className="flex h-screen text-white overflow-hidden relative">
            <div className="bg-animation"></div>
            <Sidebar title="Admin Panel" links={adminLinks} />
            <div className="flex-1 overflow-y-auto relative z-10 flex flex-col">
                {/* Mobile Header Toggle */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
                    <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">WasteSync Admin</h1>
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
