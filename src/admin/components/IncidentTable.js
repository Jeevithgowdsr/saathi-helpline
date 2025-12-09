import React from 'react';

const incidents = [
    { id: 'INC-2024-001', type: 'Medical Emergency', location: 'Indiranagar, Bangalore', time: '2 mins ago', status: 'Critical', priority: 'High' },
    { id: 'INC-2024-002', type: 'Fire Outbreak', location: 'Koramangala, Bangalore', time: '15 mins ago', status: 'Dispatched', priority: 'High' },
    { id: 'INC-2024-003', type: 'Suspicious Activity', location: 'MG Road, Bangalore', time: '45 mins ago', status: 'Investigating', priority: 'Medium' },
    { id: 'INC-2024-004', type: 'Traffic Accident', location: 'Outer Ring Road', time: '1 hour ago', status: 'Resolved', priority: 'Low' },
    { id: 'INC-2024-005', type: 'Harassment Report', location: 'Jayanagar', time: '2 hours ago', status: 'Open', priority: 'High' },
];

export function IncidentTable() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Live Incident Feed</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Priority</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {incidents.map((inc) => (
                            <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{inc.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-2">
                                        {inc.type === 'Medical Emergency' && '🚑'}
                                        {inc.type === 'Fire Outbreak' && '🔥'}
                                        {inc.type === 'Suspicious Activity' && '👁️'}
                                        {inc.type === 'Traffic Accident' && '🚗'}
                                        {inc.type === 'Harassment Report' && '🛡️'}
                                        {inc.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{inc.location}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{inc.time}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                    ${inc.status === 'Critical' ? 'bg-red-100 text-red-700' :
                                            inc.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' :
                                                inc.status === 'Investigating' ? 'bg-yellow-100 text-yellow-700' :
                                                    inc.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                  `}>
                                        {inc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${inc.priority === 'High' ? 'bg-red-500' : inc.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                        <span className="text-sm text-gray-600">{inc.priority}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
