import React, { useState, useEffect } from 'react';
import { ML_API_URL } from '../config';

export function SafetyAlertSystem() {
    const [alerts, setAlerts] = useState([]);
    const [lastChecked, setLastChecked] = useState(0);

    useEffect(() => {
        const checkRisk = async (lat, lon) => {
            // Rate limit: Check max once every 20 seconds
            const now = Date.now();
            if (now - lastChecked < 20000) return;

            try {
                const res = await fetch(`${ML_API_URL}/alerts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer mock-token'
                    },
                    body: JSON.stringify({ lat, lon })
                });
                const geojson = await res.json();

                if (geojson.features && geojson.features.length > 0) {
                    // Extract properties from GeoJSON features
                    const alertsData = geojson.features.map(f => f.properties);

                    setAlerts(alertsData);
                    setLastChecked(now);

                    // Play alert sound
                    playAlertSound();
                } else {
                    setAlerts([]);
                }
            } catch (err) {
                console.error("Risk check failed", err);
            }
        };

        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    checkRisk(pos.coords.latitude, pos.coords.longitude);
                },
                (err) => console.error(err),
                { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [lastChecked]);

    const playAlertSound = () => {
        // Simple beep or alert sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed", e));
    };

    if (alerts.length === 0) return null;

    return (
        <div className="fixed top-24 left-4 right-4 z-[100] flex flex-col gap-2 animate-bounce-in">
            {alerts.map((alert, idx) => (
                <div
                    key={idx}
                    className={`p-4 rounded-xl shadow-2xl border-l-8 flex items-start gap-4 backdrop-blur-md
                        ${alert.severity === 'critical' ? 'bg-red-100/90 border-red-600 text-red-900' :
                            alert.severity === 'high' ? 'bg-orange-100/90 border-orange-500 text-orange-900' :
                                'bg-yellow-100/90 border-yellow-500 text-yellow-900'}
                    `}
                >
                    <div className="text-3xl">
                        {alert.type === 'crime_hotspot' ? '⚠️' :
                            alert.type === 'accident_zone' ? '🚗' :
                                alert.type === 'women_safety' ? '🛡️' : '⛈️'}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-lg uppercase tracking-wider">{alert.title}</h4>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-xs mt-1 opacity-75">Distance: {alert.distance_from_center_km}km from center</p>
                    </div>
                    <button
                        onClick={() => setAlerts(prev => prev.filter((_, i) => i !== idx))}
                        className="text-2xl font-bold opacity-50 hover:opacity-100"
                    >
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
}
