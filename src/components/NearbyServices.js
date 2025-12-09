import React, { useState, useEffect } from 'react';
import { ML_API_URL } from '../config';

export function NearbyServices() {
    const [services, setServices] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                    fetchNearbyServices(position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    console.error("Location error:", err);
                    setError("Location access denied. Using default location (Bangalore).");
                    // Fallback to Bangalore for demo
                    fetchNearbyServices(12.9716, 77.5946);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    }, []);

    const fetchNearbyServices = async (lat, lon) => {
        try {
            const response = await fetch(`${ML_API_URL}/nearby`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lon })
            });

            if (!response.ok) throw new Error("Failed to fetch nearby services");

            const data = await response.json();
            setServices(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Could not connect to Geo Service.");
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'police': return '👮';
            case 'hospital': return '🏥';
            case 'women_safety': return '👩';
            case 'fire_station': return '🚒';
            case 'child_helpline': return '👶';
            default: return '📍';
        }
    };

    const getTitle = (type) => {
        return type.replace('_', ' ').toUpperCase();
    };

    if (loading) return (
        <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error && !services) return (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
            {error}
        </div>
    );

    return (
        <div className="w-full max-w-6xl mx-auto mt-12 px-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <span>📍</span> Nearest Emergency Services
                {location && <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">Based on your GPS</span>}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services && Object.entries(services).map(([type, data]) => (
                    <div key={type} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-6xl transform translate-x-2 -translate-y-2">
                            {getIcon(type)}
                        </div>

                        <div className="flex items-start justify-between mb-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-2xl">
                                {getIcon(type)}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${data.availability_status === 'Open Now' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {data.availability_status}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{data.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <span>⭐ {data.rating}</span>
                            <span>•</span>
                            <span>{data.distance_km} km away</span>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-center">
                                <div className="text-xs text-gray-400 uppercase font-bold">ETA</div>
                                <div className="text-lg font-black text-blue-600 dark:text-blue-400">{data.eta_minutes} min</div>
                            </div>
                            <button
                                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${data.coordinates.lat},${data.coordinates.lon}`, '_blank')}
                                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                            >
                                Navigate ➔
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
