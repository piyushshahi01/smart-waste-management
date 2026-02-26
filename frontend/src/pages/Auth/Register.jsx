import { API_BASE_URL } from '../../apiConfig';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, ArrowRight, Loader2, ShieldCheck, User } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        passkey: '',
        vehicleNumber: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || data.message || 'Registration failed');
            }

            // Save token and navigate
            localStorage.setItem('token', data.token);
            const userRole = data.user?.role || formData.role;
            localStorage.setItem('role', userRole);

            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            if (data.user?.role === 'admin' || formData.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (data.user?.role === 'collector' || formData.role === 'collector') {
                navigate('/collector/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] relative overflow-hidden p-4">
            {/* Background gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl relative z-10 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                        <Leaf className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Join Platform
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm text-center">
                        Create an account to start tracking waste
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-4 mb-6">
                    <button
                        type="button"
                        className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${formData.role === 'user'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                            }`}
                        onClick={() => setFormData({ ...formData, role: 'user', passkey: '', vehicleNumber: '' })}
                    >
                        <User className="w-5 h-5" />
                        <span className="text-xs font-medium">Resident</span>
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${formData.role === 'collector'
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                            : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                            }`}
                        onClick={() => setFormData({ ...formData, role: 'collector' })}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="text-xs font-medium">Driver</span>
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${formData.role === 'admin'
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                            : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                            }`}
                        onClick={() => setFormData({ ...formData, role: 'admin', vehicleNumber: '' })}
                    >
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-xs font-medium">Admin</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Conditional Admin Secret Field */}
                    {formData.role === 'admin' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-cyan-400 mb-1">
                                Admin Secret Key (Required)
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.passkey}
                                onChange={(e) => setFormData({ ...formData, passkey: e.target.value })}
                                className="w-full bg-cyan-950/30 border border-cyan-500/50 rounded-xl px-4 py-3 text-white placeholder-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                placeholder="Enter admin authorization key"
                            />
                        </div>
                    )}

                    {/* Conditional Collector Fields */}
                    {formData.role === 'collector' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-400 mb-1">
                                    Driver Passkey (Required)
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.passkey}
                                    onChange={(e) => setFormData({ ...formData, passkey: e.target.value })}
                                    className="w-full bg-blue-950/30 border border-blue-500/50 rounded-xl px-4 py-3 text-white placeholder-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Enter driver authorization key"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-400 mb-1">
                                    Vehicle Number Plate
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.vehicleNumber}
                                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                                    className="w-full bg-blue-950/30 border border-blue-500/50 rounded-xl px-4 py-3 text-white placeholder-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
                                    placeholder="e.g. DL 1C AA 1111"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-medium py-3 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 ${formData.role === 'admin' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' :
                            formData.role === 'collector' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                                'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                            }`}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                        Log in here
                    </Link>
                </div>
            </div>
        </div>
    );
}
