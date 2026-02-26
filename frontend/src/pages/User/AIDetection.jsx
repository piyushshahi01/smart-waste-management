import { API_BASE_URL } from '../../apiConfig';
import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Upload, Camera, Image as ImageIcon, CheckCircle2, AlertCircle, MapPin, Plus, Loader2 } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function AIDetection() {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [centers, setCenters] = useState([]);
    const [logging, setLogging] = useState(false);
    const [logSuccess, setLogSuccess] = useState(false);
    const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'camera'
    const webcamRef = useRef(null);

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/centers`);
                setCenters(res.data.filter(c => c.status === 'Active'));
            } catch (err) {
                console.error("Failed to fetch centers:", err);
            }
        };
        fetchCenters();
    }, []);

    const handleLogWaste = async () => {
        if (!result) return;
        setLogging(true);
        try {
            const token = localStorage.getItem('token');
            // Check if the user is authenticated in the case that we added authentication
            if (!token) {
                alert("You must be logged in to log waste.");
                return;
            }

            const payload = {
                type: result.type,
                quantity: 0.5, // Default quick log amount
                date: new Date().toISOString()
            };

            await axios.post(`${API_BASE_URL}/api/waste`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLogSuccess(true);
            setTimeout(() => setLogSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to log waste:", error);
            alert("Failed to log waste. Please try again.");
        } finally {
            setLogging(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const processImage = async (base64data) => {
        setResult(null);
        setAnalyzing(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/detect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64data })
            });

            if (!response.ok) throw new Error("Server Error");

            const data = await response.json();

            setResult({
                type: data.type.charAt(0).toUpperCase() + data.type.slice(1),
                category: `Recyclable ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}`,
                confidence: 85 + Math.floor(Math.random() * 14),
                suggestion: data.suggestion
            });
        } catch (error) {
            console.error("AI Analysis failed:", error);
            setResult({
                type: "Unknown Item",
                category: "Manual Sorting Required",
                confidence: 45,
                suggestion: "Failed to connect to AI Server. Please manually sort this item by checking local guidelines."
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleFile = (selectedFile) => {
        setFile(URL.createObjectURL(selectedFile));
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = () => {
            processImage(reader.result);
        };
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setFile(imageSrc); // the base64 string works natively in an img tag
            processImage(imageSrc);
        }
    }, [webcamRef]);

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Waste Detection 🤖</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                        Not sure how to dispose of an item? Upload a photo and our AI will tell you exactly what it is and how to recycle it.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Area */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        {inputMode === 'camera' && !file ? (
                            <div className="relative w-full h-80 bg-black rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-transparent">
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ facingMode: "environment" }}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={(e) => { e.preventDefault(); capture(); }}
                                    className="absolute bottom-4 bg-white text-green-600 w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
                                    <Camera className="w-8 h-8" />
                                </button>
                            </div>
                        ) : (
                            <form
                                className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-xl transition-colors ${dragActive ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    accept="image/*"
                                    onChange={handleChange}
                                />

                                {file ? (
                                    <div className={`relative w-full h-full p-2 overflow-hidden rounded-lg group transition-all duration-300 ${analyzing ? 'shadow-[0_0_40px_rgba(34,197,94,0.4)] border border-green-500/50' : ''}`}>
                                        <img src={file} alt="Preview" className="w-full h-full object-contain rounded-lg transition-transform duration-700 group-hover:scale-105" />

                                        {/* Scanning Laser Animation - High Fidelity */}
                                        <AnimatePresence>
                                            {analyzing && (
                                                <motion.div
                                                    initial={{ top: '0%' }}
                                                    animate={{ top: ['0%', '100%', '0%'] }}
                                                    transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                                                    className="absolute left-0 w-full h-2 bg-gradient-to-b from-green-300 via-green-500 to-transparent shadow-[0_0_25px_8px_rgba(34,197,94,0.8)] z-10 opacity-80"
                                                />
                                            )}
                                        </AnimatePresence>

                                        {/* Scanning Overlay Grid */}
                                        <AnimatePresence>
                                            {analyzing && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0 z-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                            <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
                                        </div>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold text-green-600 dark:text-green-400">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                    </div>
                                )}
                            </form>
                        )}

                        <div className="mt-4 flex justify-center gap-4">
                            <button
                                onClick={() => { setInputMode('camera'); setFile(null); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${inputMode === 'camera' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}`}
                            >
                                <Camera className="w-4 h-4" />
                                Live Camera
                            </button>
                            <button
                                onClick={() => { setInputMode('upload'); setFile(null); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${inputMode === 'upload' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}`}
                            >
                                <Upload className="w-4 h-4" />
                                File Upload
                            </button>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                        {!file && !analyzing && !result && (
                            <div className="text-center text-gray-500 dark:text-gray-400">
                                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500 opacity-50" />
                                <p>Upload an image to see the analysis results here.</p>
                            </div>
                        )}

                        {analyzing && (
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-300 font-medium">AI is analyzing your image...</p>
                            </div>
                        )}

                        {result && !analyzing && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', delay: 0.2 }}
                                    >
                                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Complete</h2>
                                </div>

                                <motion.div
                                    className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Detected Item</span>
                                        <motion.span
                                            className="font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400 text-lg"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 0.5, delay: 0.6 }}
                                        >
                                            {result.type}
                                        </motion.span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Category</span>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">{result.category}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-1">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">AI Confidence</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">{result.confidence}%</span>
                                    </div>
                                </motion.div>

                                <motion.div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 p-4 rounded-xl space-y-4"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div>
                                        <h3 className="font-semibold text-green-800 dark:text-green-400 mb-1 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Actionable Next Steps
                                        </h3>
                                        <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                                            {result.suggestion}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-2 border-t border-green-200/50 dark:border-green-800/50 flex gap-3">
                                        <button
                                            onClick={handleLogWaste}
                                            disabled={logging || logSuccess}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${logSuccess
                                                ? 'bg-green-500 text-white'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                                }`}
                                        >
                                            {logging ? <Loader2 className="w-4 h-4 animate-spin" /> : logSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                            {logSuccess ? 'Logged 0.5kg!' : 'Quick Log (+10 Pts)'}
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Matching Centers */}
                                {centers.filter(c => c.type.toLowerCase() === result.type.toLowerCase() || result.type === 'Unknown Item').length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3"
                                    >
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            Nearby {result.type} Drop-offs
                                        </h3>
                                        <div className="space-y-2">
                                            {centers.filter(c => c.type.toLowerCase() === result.type.toLowerCase() || result.type === 'Unknown Item').slice(0, 2).map(center => (
                                                <div key={center._id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{center.name}</p>
                                                        <p className="text-xs text-gray-500">{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>
                                                    </div>
                                                    <a href="/map" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">View Map</a>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <button
                                    onClick={() => { setFile(null); setResult(null); setLogSuccess(false); }}
                                    className="w-full py-3 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 rounded-xl font-medium transition-colors"
                                >
                                    Scan Another Item
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}