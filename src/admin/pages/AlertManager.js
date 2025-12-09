import React, { useState, useEffect } from 'react';
import { getAlerts, createAlert, deleteAlert } from '../services/alertService';

export function AlertManager() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAlerts();
            setAlerts(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createAlert(formData);
            setIsModalOpen(false);
            setFormData(initialFormState);
            loadData();
            alert("Alert Broadcasted Successfully!");
        } catch (err) {
            alert("Failed to broadcast alert");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this alert record?")) {
            await deleteAlert(id);
            loadData();
        }
    };

    const handleCheckbox = (channel) => {
        setFormData(prev => ({
            ...prev,
            channels: prev.channels.includes(channel)
                ? prev.channels.filter(c => c !== channel)
                : [...prev.channels, channel]
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Alert Broadcasting</h1>
                    <p className="text-gray-500 text-sm">Send emergency notifications to specific regions</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-red-500/30 animate-pulse"
                >
                    <span>📢</span> Broadcast New Alert
                </button>
            </div>

            {/* Alerts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alerts.map((alert) => (
                    <div key={alert.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                    alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'}
                            `}>
                                {alert.severity}
                            </span>
                            <span className="text-xs text-gray-400">
                                {alert.createdAt?.toDate ? alert.createdAt.toDate().toLocaleDateString() : 'Just now'}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 mb-2">{alert.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{alert.body}</p>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                            <span>📍 {alert.region}</span>
                            <span>•</span>
                            <span>{alert.type}</span>
                        </div>

                        <div className="flex gap-2 mt-auto">
                            {alert.channels.includes('push') && <span className="text-xs bg-gray-100 px-2 py-1 rounded">🔔 Push</span>}
                            {alert.channels.includes('sms') && <span className="text-xs bg-gray-100 px-2 py-1 rounded">💬 SMS</span>}
                        </div>

                        <button
                            onClick={() => handleDelete(alert.id)}
                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-red-600">Broadcast Emergency Alert</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alert Title</label>
                                <input required className="w-full border rounded p-2" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Flash Flood Warning" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                                <textarea required rows="3" className="w-full border rounded p-2" value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })} placeholder="Detailed instructions..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select className="w-full border rounded p-2" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="weather">Weather</option>
                                        <option value="crime">Crime</option>
                                        <option value="accident">Accident</option>
                                        <option value="women_safety">Women Safety</option>
                                        <option value="health">Public Health</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                    <select className="w-full border rounded p-2" value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Region</label>
                                <input required className="w-full border rounded p-2" value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} placeholder="e.g. Indiranagar, Bangalore" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Channels</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.channels.includes('push')} onChange={() => handleCheckbox('push')} />
                                        <span>Push Notification</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.channels.includes('sms')} onChange={() => handleCheckbox('sms')} />
                                        <span>SMS Fallback</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                                    <input type="datetime-local" className="w-full border rounded p-2" value={formData.expiresAt} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold shadow-lg shadow-red-500/30">
                                    BROADCAST ALERT
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const initialFormState = {
    title: '',
    body: '',
    type: 'weather',
    severity: 'high',
    region: '',
    channels: ['push'],
    expiresAt: '',
    status: 'active'
};
