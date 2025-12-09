import React, { useState, useEffect } from 'react';
import { ML_API_URL } from '../config';
import { Bell, Calendar, MapPin, ExternalLink, ShieldAlert } from 'lucide-react';

export function CrimeNews() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Determine location (mock logic, normally from user state)
                const response = await fetch(`${ML_API_URL}/news?location=Karnataka`);
                if (!response.ok) throw new Error('Failed to fetch news');
                const data = await response.json();
                setNews(data.articles);
            } catch (err) {
                console.error("News fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) return (
        <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
    );

    if (error) return null; // Hide section on error

    return (
        <div className="max-w-7xl mx-auto px-4 mt-16 animate-fadeInUp">
            <div className="flex items-center gap-3 mb-8 justify-center">
                <ShieldAlert className="w-8 h-8 text-red-600" />
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                    <span className="text-gradient">Crime & Safety Watch</span>
                </h2>
            </div>

            <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Real-time updates on safety incidents and alerts in your region for the past week.
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {news.map((item) => (
                    <div key={item.id} className="glass dark:glass-dark rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20 group">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Alert
                                </span>
                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                    {item.source}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100 group-hover:text-blue-500 transition-colors line-clamp-2">
                                {item.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                                {item.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {item.publishedAt}
                                    </span>
                                </div>
                                <button className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-semibold">
                                    Details <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
