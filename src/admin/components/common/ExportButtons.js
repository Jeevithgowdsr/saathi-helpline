import React from 'react';
import { exportToCSV, exportToPDF } from '../../services/exportService';

export function ExportButtons({ data, filename, pdfTitle, columns }) {
    return (
        <div className="flex gap-2">
            <button
                onClick={() => exportToCSV(data, filename)}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors border border-green-200"
                title="Download CSV"
            >
                <span>📊</span> CSV
            </button>
            <button
                onClick={() => exportToPDF(data, pdfTitle || filename, columns)}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors border border-red-200"
                title="Download PDF"
            >
                <span>📄</span> PDF
            </button>
        </div>
    );
}
