import React, { useState, useEffect } from 'react';
import {
    getHelplines, addHelpline, updateHelpline, deleteHelpline,
    toggleVerification, togglePromotion, toggleActive
} from '../services/helplineService';

export function HelplineManager() {
    const [helplines, setHelplines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getHelplines();
            setHelplines(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateHelpline(editingItem.id, formData);
            } else {
                await addHelpline(formData);
            }
            setIsModalOpen(false);
            setFormData(initialFormState);
            setEditingItem(null);
            loadData();
        } catch (err) {
            alert("Operation failed");
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this helpline?")) {
            await deleteHelpline(id);
            loadData();
        }
    };

    const handleAction = async (action, item) => {
        if (action === 'verify') await toggleVerification(item.id, item.isVerified);
        if (action === 'promote') await togglePromotion(item.id, item.isPromoted);
        if (action === 'deactivate') await toggleActive(item.id, item.isActive);
        loadData();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Helpline Management</h1>
                <button
                    onClick={() => { setEditingItem(null); setFormData(initialFormState); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                >
                    <span>➕</span> Add New Helpline
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Name / Number</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Coverage</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {helplines.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{item.name}</div>
                                        <div className="text-sm text-gray-500">{item.number}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {item.languages?.join(', ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {item.geoCoverage}
                                    </td>
                                    <td className="px-6 py-4 space-y-1">
                                        {item.isVerified && <span className="block w-fit px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">VERIFIED</span>}
                                        {item.isPromoted && <span className="block w-fit px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">PROMOTED</span>}
                                        {!item.isActive && <span className="block w-fit px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">INACTIVE</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${item.authenticityScore > 80 ? 'bg-green-500' : item.authenticityScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${item.authenticityScore}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold">{item.authenticityScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleAction('verify', item)} title="Toggle Verify" className="p-1 hover:bg-gray-200 rounded">✅</button>
                                        <button onClick={() => handleAction('promote', item)} title="Toggle Promote" className="p-1 hover:bg-gray-200 rounded">⭐</button>
                                        <button onClick={() => handleEdit(item)} title="Edit" className="p-1 hover:bg-gray-200 rounded">✏️</button>
                                        <button onClick={() => handleAction('deactivate', item)} title={item.isActive ? "Deactivate" : "Activate"} className="p-1 hover:bg-gray-200 rounded">
                                            {item.isActive ? '🚫' : '🔄'}
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} title="Delete" className="p-1 hover:bg-red-100 text-red-600 rounded">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                            {helplines.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No helplines found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingItem ? 'Edit Helpline' : 'Add New Helpline'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input required className="w-full border rounded p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                                    <input required className="w-full border rounded p-2" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select className="w-full border rounded p-2" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="Police">Police</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Fire">Fire</option>
                                    <option value="Women Safety">Women Safety</option>
                                    <option value="Mental Health">Mental Health</option>
                                    <option value="Disaster">Disaster Management</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Languages (comma separated)</label>
                                <input
                                    className="w-full border rounded p-2"
                                    value={formData.languages.join(', ')}
                                    onChange={e => setFormData({ ...formData, languages: e.target.value.split(',').map(s => s.trim()) })}
                                    placeholder="English, Hindi, Kannada"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Geo Coverage</label>
                                    <input className="w-full border rounded p-2" value={formData.geoCoverage} onChange={e => setFormData({ ...formData, geoCoverage: e.target.value })} placeholder="e.g. Bangalore, Karnataka" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                                    <input className="w-full border rounded p-2" value={formData.availability} onChange={e => setFormData({ ...formData, availability: e.target.value })} placeholder="e.g. 24/7" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Authenticity Score (0-100)</label>
                                <input
                                    type="number" min="0" max="100"
                                    className="w-full border rounded p-2"
                                    value={formData.authenticityScore}
                                    onChange={e => setFormData({ ...formData, authenticityScore: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
                                    {editingItem ? 'Update Helpline' : 'Create Helpline'}
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
    name: '',
    number: '',
    category: 'Police',
    languages: [],
    geoCoverage: '',
    availability: '24/7',
    authenticityScore: 50
};
