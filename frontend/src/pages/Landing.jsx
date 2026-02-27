import { useNavigate } from 'react-router-dom';
import { Leaf, Navigation, BarChart3, BellRing, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from '../components/MagneticButton';

const features = [
    {
        icon: Navigation,
        title: "AI Route Optimization",
        description: "Dynamic geofencing and smart routing algorithms reduce fuel consumption by up to 30% while ensuring zero missed pickups."
    },
    {
        icon: BellRing,
        title: "Live IoT Monitoring",
        description: "Smart bin sensors feed real-time capacity and chemical data, alerting fleet managers instantly to prevent hazardous overflows."
    },
    {
        icon: BarChart3,
        title: "Predictive Analytics",
        description: "Transform raw city data into actionable insights. Forecast waste generation hotspots before they become a problem."
    }
];

export default function Landing() {
    const navigate = useNavigate();
    const { scrollY } = useScroll();

    // Parallax background effect
    const backgroundY = useTransform(scrollY, [0, 1000], ['0%', '20%']);
    const opacityDown = useTransform(scrollY, [0, 300], [1, 0]);

    // Handle seamless routing transitions
    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="relative min-h-screen bg-[#030305] text-white selection:bg-emerald-500/30 overflow-x-hidden pt-20 w-full max-w-full">
            {/* Fluid Animated Background Gradients */}
            <motion.div
                style={{ y: backgroundY }}
                className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
            >
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen" />
            </motion.div>

            {/* Navbar (Minimal) */}
            <nav className="fixed top-0 left-0 right-0 p-6 z-50 flex justify-between items-center backdrop-blur-md bg-black/10 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                    >
                        <Leaf className="w-5 h-5 text-white" />
                    </motion.div>
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                    >
                        WasteSync
                    </motion.span>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex gap-4"
                >
                    <MagneticButton onClick={() => handleNavigation('/login')} className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Sign In
                    </MagneticButton>
                    <MagneticButton onClick={() => handleNavigation('/register')} className="px-5 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all">
                        Get Started
                    </MagneticButton>
                </motion.div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-24 h-24 bg-gradient-to-br from-orange-400/20 to-red-500/20 backdrop-blur-3xl rounded-3xl mb-8 flex items-center justify-center border border-white/10 shadow-[0_0_50px_rgba(249,115,22,0.2)]"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    >
                        <Leaf className="w-12 h-12 text-orange-400" />
                    </motion.div>
                </motion.div>

                <div className="text-center max-w-4xl mx-auto space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight"
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                            Intelligence
                        </span>
                        <br />
                        <span className="text-white">Meets Ecology.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        The ultimate platform for urban waste management. Optimize fleets, track smart bins in real-time, and build a greener tomorrow.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row gap-6 mt-12"
                >
                    <MagneticButton
                        onClick={() => handleNavigation('/login')}
                        className="group relative px-8 py-4 bg-orange-500 text-black text-lg font-bold rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] transition-all"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                        <span className="relative flex items-center gap-2">
                            Enter Platform <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </MagneticButton>
                    <MagneticButton
                        onClick={() => handleNavigation('/register')}
                        className="group flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-lg font-medium rounded-2xl transition-all"
                    >
                        Create Account
                    </MagneticButton>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity: opacityDown }}
                    className="absolute bottom-10 flex flex-col items-center gap-3 text-gray-500"
                >
                    <span className="text-xs tracking-widest uppercase font-semibold">Discover</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1 h-8 rounded-full bg-gradient-to-b from-gray-500 to-transparent"
                    />
                </motion.div>
            </main>

            {/* Features Section */}
            <section className="relative z-10 py-32 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 60, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 1.2, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[32px] hover:bg-white/10 transition-colors group cursor-default"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:border-orange-500/50 transition-colors">
                                <feature.icon className="w-6 h-6 text-orange-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed font-light">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* About Us Section */}
            <section className="relative z-10 py-20 px-4 max-w-4xl mx-auto text-center" id="about">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white/5 border border-white/10 backdrop-blur-xl p-10 md:p-14 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-orange-500/20 blur-[80px] rounded-full pointer-events-none" />

                    <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-8">
                        About the Creator
                    </h2>

                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 mx-auto flex items-center justify-center text-4xl font-black text-black shadow-[0_0_30px_rgba(249,115,22,0.3)] mb-6">
                        P
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3">Piyush</h3>
                    <p className="text-orange-400 text-sm font-semibold tracking-widest uppercase mb-6">Founder & Lead Engineer</p>

                    <p className="text-gray-300 text-lg leading-relaxed font-light mb-8 max-w-2xl mx-auto">
                        Passionate developer and innovator dedicated to building intelligent solutions for a sustainable future. WasteSync AI was developed to bridge the gap between cutting-edge technology and ecological responsibility. Modern problems require modern, data-driven solutions.
                    </p>

                    <div className="flex justify-center gap-4 pointer-events-auto">
                        <a
                            href="https://github.com/piyushshahi01"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 bg-black/40 hover:bg-black/80 border border-white/10 text-white rounded-full transition-all hover:border-orange-500/50 text-sm font-medium hover:shadow-[0_0_15px_rgba(249,115,22,0.2)] block"
                        >
                            GitHub
                        </a>
                        <a
                            href="https://www.linkedin.com/in/piyush-singh-shahi-a70627379"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 bg-black/40 hover:bg-black/80 border border-white/10 text-white rounded-full transition-all hover:border-red-500/50 text-sm font-medium hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] block"
                        >
                            LinkedIn
                        </a>
                    </div>

                </motion.div>
            </section>

            {/* Micro Footer */}
            <footer className="relative z-10 border-t border-white/10 py-8 text-center text-sm text-gray-600">
                <p>© 2026 WasteSync AI. A project for a cleaner planet.</p>
            </footer>
        </div >
    );
}
