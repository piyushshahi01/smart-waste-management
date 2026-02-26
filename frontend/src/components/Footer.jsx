import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="relative z-10 py-6 px-4 md:px-8 w-full bg-[#030305] border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 font-medium overflow-hidden">
            {/* Slim Glow Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

            <div className="flex items-center gap-2 mb-4 md:mb-0">
                <span className="font-bold text-gray-300">WasteSync AI</span>
                <span>© 2026. A project for a cleaner planet.</span>
            </div>

            <div className="flex items-center gap-6">
                <a onClick={() => navigate('/user/profile')} className="hover:text-orange-400 cursor-pointer transition-colors duration-300 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-[10px] font-black text-black">P</div>
                    Profile
                </a>
                <a href="#" className="hover:text-orange-400 cursor-pointer transition-colors duration-300">Instagram</a>
                <a href="#" className="hover:text-orange-400 cursor-pointer transition-colors duration-300">Twitter</a>
                <a href="#" className="hover:text-orange-400 cursor-pointer transition-colors duration-300">LinkedIn</a>
            </div>
        </footer>
    );
}
