import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function Sidebar({ title, links }) {
    const sidebar = useSidebar();

    if (!sidebar) return null; // prevent crash

    const { isMobileOpen, setIsMobileOpen } = sidebar;

    useEffect(() => {
        const handleOpen = () => setIsMobileOpen(true);
        window.addEventListener('open-sidebar', handleOpen);
        return () => window.removeEventListener('open-sidebar', handleOpen);
    }, [setIsMobileOpen]);

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`fixed inset-y-0 left-0 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-72 md:w-64 glass-panel border-r border-white/20 dark:border-white/5 flex flex-col h-full shadow-2xl md:shadow-sm z-50`}>
                <div className="p-6 border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400">
                        <div className="bg-gradient-to-br from-orange-400 to-red-600 p-2 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                            <Icons.Activity className="w-6 h-6 text-white" />
                        </div>
                        {title}
                    </h2>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden p-2 rounded-full bg-gray-100 dark:bg-black/50 text-gray-500 hover:text-orange-500 transition-colors"
                    >
                        <Icons.X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto relative">
                    {links.map((link) => {
                        const IconComponent = Icons[link.icon] || Icons.Circle;
                        return (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsMobileOpen(false)} // Close on navigation in mobile
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 group relative overflow-hidden active:scale-95 ${isActive
                                        ? 'text-orange-600 dark:text-orange-400 font-semibold shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)] dark:shadow-[0_0_15px_-5px_rgba(249,115,22,0.3)]'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-orange-50/80 dark:bg-orange-900/20 border border-orange-500/10 dark:border-orange-400/20 rounded-xl"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        {/* Hover Micro-interaction indicator */}
                                        <div className="absolute left-0 w-1 h-0 bg-gradient-to-b from-orange-400 to-red-600 rounded-r-full group-hover:h-2/3 transition-all duration-300 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />

                                        <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 relative z-10" />
                                        <span className="relative z-10">{link.name}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200/50 dark:border-white/5">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('role');
                            localStorage.removeItem('user');
                            window.location.href = '/login';
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors font-semibold group"
                    >
                        <Icons.LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        Log Out
                    </button>
                </div>
            </div>
        </>
    );
}
