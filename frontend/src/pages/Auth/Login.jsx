import { API_BASE_URL } from '../../apiConfig';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Recycle, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passkey, setPasskey] = useState('');
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [isDriverLogin, setIsDriverLogin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = (isAdminLogin || isDriverLogin)
                ? { email, password, passkey }
                : { email, password };

            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, payload);
            const { token, role, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }

            if (role === 'admin') {
                window.location.href = '/admin/dashboard';
            } else if (role === 'collector') {
                window.location.href = '/collector/dashboard';
            } else {
                window.location.href = '/user/dashboard';
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-black">
            {/* The Video Background */}
            <video
                autoPlay
                loop
                muted
                className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover brightness-50"
            >
                <source src="http://googleusercontent.com/generated_video_content/13837432959034964136" type="video/mp4" />
            </video>

            {/* Glowing Border Wrapper for the Login Card */}
            <div className="relative z-10 w-full max-w-md animate-fade-in-up group">
                {/* Border Beam Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-[24px] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>

                {/* The Modern Login Card */}
                <div className="bg-black/40 border border-white/10 p-8 rounded-[24px] shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl relative">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            <Recycle className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Welcome Back
                        </h2>
                        <p className="text-gray-400 mt-2 text-sm text-center">
                            Log in to manage your waste management platform
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAdminLogin}
                                    onChange={(e) => {
                                        setIsAdminLogin(e.target.checked);
                                        if (e.target.checked) setIsDriverLogin(false);
                                        if (!e.target.checked) setPasskey('');
                                    }}
                                    className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500/50"
                                />
                                Log in as Administrator
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isDriverLogin}
                                    onChange={(e) => {
                                        setIsDriverLogin(e.target.checked);
                                        if (e.target.checked) setIsAdminLogin(false);
                                        if (!e.target.checked) setPasskey('');
                                    }}
                                    className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/50"
                                />
                                Log in as Driver
                            </label>
                        </div>

                        {isAdminLogin && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-cyan-400 mb-2">
                                    Admin Passkey
                                </label>
                                <input
                                    type="password"
                                    required={isAdminLogin}
                                    value={passkey}
                                    onChange={(e) => setPasskey(e.target.value)}
                                    className="w-full bg-cyan-950/30 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                    placeholder="Enter admin authorization key"
                                />
                            </div>
                        )}

                        {isDriverLogin && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-blue-400 mb-2">
                                    Driver Passkey
                                </label>
                                <input
                                    type="password"
                                    required={isDriverLogin}
                                    value={passkey}
                                    onChange={(e) => setPasskey(e.target.value)}
                                    className="w-full bg-blue-950/30 border border-blue-500/50 rounded-xl px-4 py-3 text-white placeholder-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Enter driver authorization key"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full font-medium py-3 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 ${isAdminLogin ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' :
                                isDriverLogin ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                                    'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                                }`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
