import React, { useState, useEffect } from 'react';
import { getReports, updateReportStatus, resolveReport } from '../services/reportService';

export function ReportManager() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedReport, setSelectedReport] = useState(null);
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getReports(filter);
            setReports(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleStatusChange = async (id, newStatus) => {
        await updateReportStatus(id, newStatus);
        loadData();
        if (selectedReport?.id === id) setSelectedReport(null);
    };

    const handleResolve = async (action) => {
        if (!selectedReport) return;
        await resolveReport(selectedReport.id, action, adminNote);
        setAdminNote('');
        setSelectedReport(null);
        loadData();
        alert(`Report resolved with action: ${action}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Reports</h1>
                    <p className="text-gray-500 text-sm">Manage reports of fake or abusive numbers</p>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {['all', 'pending', 'verified', 'resolved'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${filter === f ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List Column */}
                <div className="lg:col-span-2 space-y-4">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer transition-all hover:shadow-md ${selectedReport?.id === report.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                    ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        report.status === 'verified' ? 'bg-red-100 text-red-700' :
                                            report.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                                `}>
                                    {report.status}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : 'Date N/A'}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-800">{report.reportedNumber}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{report.reason}</p>
                            <p className="text-xs text-gray-400 mt-2">Reported by: {report.userId || 'Anonymous'}</p>
                        </div>
                    ))}
                    {reports.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-500">No reports found.</div>
                    )}
                </div>

                {/* Detail Column */}
                <div className="lg:col-span-1">
                    {selectedReport ? (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Report Details</h2>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Reported Number</label>
                                    <p className="text-lg font-mono text-gray-800">{selectedReport.reportedNumber}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Reason</label>
                                    <p className="text-gray-700">{selectedReport.reason}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Evidence</label>
                                    {selectedReport.evidence ? (
                                        <a href={selectedReport.evidence} target="_blank" rel="noreferrer" className="block text-blue-600 hover:underline truncate">
                                            View Attachment 📎
                                        </a>
                                    ) : (
                                        <p className="text-gray-400 italic">No evidence provided</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Admin Notes</label>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{selectedReport.adminNotes || 'None'}</p>
                                </div>
                            </div>

                            {selectedReport.status !== 'resolved' && (
                                <div className="space-y-3 pt-4 border-t border-gray-100">
                                    <textarea
                                        className="w-full border rounded p-2 text-sm"
                                        rows="2"
                                        placeholder="Add admin notes..."
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleStatusChange(selectedReport.id, 'verified')}
                                            className="bg-orange-100 text-orange-700 py-2 rounded font-bold text-sm hover:bg-orange-200"
                                        >
                                            Verify Report
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(selectedReport.id, 'rejected')}
                                            className="bg-gray-100 text-gray-700 py-2 rounded font-bold text-sm hover:bg-gray-200"
                                        >
                                            Reject
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleResolve('block_number')}
                                        className="w-full bg-red-600 text-white py-2 rounded font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-500/30"
                                    >
                                        🚫 Block Number & Resolve
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 h-64 flex items-center justify-center">
                            Select a report to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
