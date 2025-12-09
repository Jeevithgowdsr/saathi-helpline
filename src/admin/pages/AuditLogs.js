import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/auditService';
import { SearchInput, FilterDropdown, Pagination } from '../components/common/TableControls';
import { ExportButtons } from '../components/common/ExportButtons';

export function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [moduleFilter, setModuleFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        loadLogs();
    }, [moduleFilter]);

    const loadLogs = async () => {
        setLoading(true);
        const data = await getAuditLogs(100, moduleFilter); // Fetch last 100
        setLogs(data);
        setLoading(false);
    };

    // Client-side filtering & pagination
    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
                    <p className="text-gray-500 text-sm">Track all system activities and security events</p>
                </div>
                <div className="flex gap-3">
                    <ExportButtons
                        data={filteredLogs}
                        filename="audit_logs"
                        pdfTitle="System Audit Logs"
                        columns={['timestamp', 'userId', 'module', 'action', 'severity']}
                    />
                    <button onClick={loadLogs} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 border border-blue-100 rounded-lg bg-blue-50">
                        ↻ Refresh
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search logs..."
                    className="flex-1"
                />
                <FilterDropdown
                    label="Module"
                    value={moduleFilter}
                    onChange={setModuleFilter}
                    options={[
                        { value: 'all', label: 'All Modules' },
                        { value: 'AUTH', label: 'Authentication' },
                        { value: 'HELPLINES', label: 'Helplines' },
                        { value: 'INCIDENTS', label: 'Incidents' },
                        { value: 'ALERTS', label: 'Alerts' },
                        { value: 'REPORTS', label: 'User Reports' },
                    ]}
                    className="w-48"
                />
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Admin ID</th>
                                <th className="px-6 py-4">Module</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors text-sm">
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                        {log.userId}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                            ${log.module === 'AUTH' ? 'bg-purple-100 text-purple-700' :
                                                log.module === 'ALERTS' ? 'bg-red-100 text-red-700' :
                                                    log.module === 'HELPLINES' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'}
                                        `}>
                                            {log.module}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={JSON.stringify(log.details, null, 2)}>
                                        {JSON.stringify(log.details)}
                                    </td>
                                </tr>
                            ))}
                            {paginatedLogs.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}
