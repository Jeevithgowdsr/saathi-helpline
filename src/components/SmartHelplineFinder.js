import React, { useState } from 'react';
import { ML_API_URL } from '../config';

export function SmartHelplineFinder({ t }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isListening, setIsListening] = useState(false);

    const handleSearch = async (searchQuery = query) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            // Get location if possible
            let location = "India";
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    // In a real app, reverse geocode here. For now, we send coordinates or a placeholder.
                    location = `${pos.coords.latitude},${pos.coords.longitude}`;
                } catch (e) {
                    console.warn("Location access denied, using default.");
                }
            }

            const response = await fetch(`${ML_API_URL}/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: searchQuery,
                    location: location
                })
            });

            if (!response.ok) throw new Error("Failed to connect to AI Engine");

            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error(err);
            setError("AI Service Unavailable. Please try the manual search below.");
        } finally {
            setLoading(false);
        }
    };

    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // Could be dynamic based on app lang
        recognition.start();
        setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
            handleSearch(transcript);
            setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-12">
            {/* AI Search Bar */}
            <div className="relative group z-20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 border border-blue-100 dark:border-gray-700 transition-transform duration-300 focus-within:scale-[1.02]">
                    <span className="pl-4 text-2xl animate-pulse">🤖</span>
                    <input
                        type="text"
                        placeholder="Describe your emergency (e.g., 'I feel unsafe', 'Fire in building')..."
                        className="w-full p-4 bg-transparent border-none focus:ring-0 text-lg text-gray-800 dark:text-white placeholder-gray-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <div className="flex items-center gap-2 pr-2">
                        <button
                            onClick={startVoiceInput}
                            className={`p-3 rounded-xl transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300'}`}
                            title="Voice Search"
                        >
                            {isListening ? 'Listening...' : '🎤'}
                        </button>
                        <button
                            onClick={() => handleSearch()}
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 flex items-center gap-3 animate-fadeIn">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="mt-8 flex flex-col items-center gap-4 animate-fadeIn">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Analyzing crisis & finding help...</p>
                </div>
            )}

            {/* Results */}
            {results && !loading && (
                <div className="mt-8 animate-fadeInUp">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <span>🎯</span> Top Recommendations
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Detected: <span className="font-semibold text-blue-600 dark:text-blue-400">{results.input_analysis.category}</span>
                                <span className="mx-2">•</span>
                                Confidence: <span className="font-semibold text-green-600 dark:text-green-400">{(results.input_analysis.classification_confidence * 100).toFixed(0)}%</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {results.recommendations.map((rec, idx) => (
                            <div key={idx} className="relative group bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                {/* Priority Badge */}
                                {idx === 0 && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-red-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-bl-2xl shadow-md z-10">
                                        BEST MATCH
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-3xl">
                                        {getIconForCategory(rec.category)}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Relevance</div>
                                        <div className="text-lg font-black text-blue-600 dark:text-blue-400">{rec.recommendation_score}/10</div>
                                    </div>
                                </div>

                                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{rec.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{rec.explanation_text}</p>

                                <div className="flex items-center gap-3 mt-auto">
                                    <a
                                        href={`tel:${rec.number}`}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-bold text-center shadow-lg shadow-green-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <span>📞</span> Call {rec.number}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function getIconForCategory(category) {
    const map = {
        'Police': '👮',
        'Women': '👩',
        'Mental': '🧠',
        'Child': '👶',
        'Fire': '🔥',
        'Medical': '🚑',
        'Cyber': '💻',
        'Senior': '👴'
    };
    // Simple partial match
    for (const key in map) {
        if (category && category.includes(key)) return map[key];
    }
    return '🆘';
}
