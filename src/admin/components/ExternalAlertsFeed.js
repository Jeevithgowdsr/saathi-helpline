import React, { useState, useEffect } from 'react';
import { fetchAllExternalAlerts } from '../services/externalApiService';

export function ExternalAlertsFeed() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const data = await fetchAllExternalAlerts();
            setAlerts(data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Failed to load external alerts", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadAlerts();

        // Auto-refresh every 15 minutes
        const interval = setInterval(loadAlerts, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <span>🌐</span> External Agency Feeds
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Live updates from IMD, NDRF, CERT-In
                    </p>
                </div>
                <div className="text-right">
                    <button
                        onClick={loadAlerts}
                        className={`text-xs bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1 ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? '↻' : '↻ Refresh'}
                    </button>
                    {lastUpdated && (
                        <p className="text-[10px] text-gray-400 mt-1">
                            Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>
            </div>

            <div className="overflow-y-auto flex-1 p-0">
                {alerts.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-l-4"
                                style={{ borderLeftColor: alert.severity === 'critical' ? '#EF4444' : alert.severity === 'high' ? '#F97316' : '#3B82F6' }}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider
                                        ${alert.type === 'weather' ? 'bg-blue-100 text-blue-700' :
                                            alert.type === 'disaster' ? 'bg-red-100 text-red-700' :
                                                'bg-purple-100 text-purple-700'}
                                    `}>
                                        {alert.source}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-gray-800 mb-1">{alert.title}</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">{alert.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                        <span className="text-2xl">✅</span>
                        <span>No active external threats detected.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
