import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

/**
 * Convert JSON data to CSV and trigger download
 * @param {Array} data - Array of objects
 * @param {string} filename - Desired filename without extension
 */
export const exportToCSV = (data, filename) => {
    if (!data || !data.length) {
        alert("No data to export");
        return;
    }

    // Extract headers
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row => headers.map(fieldName => {
            let value = row[fieldName];
            // Handle objects/dates
            if (typeof value === 'object' && value !== null) {
                if (value.seconds) { // Firestore Timestamp
                    value = new Date(value.seconds * 1000).toISOString();
                } else {
                    value = JSON.stringify(value).replace(/,/g, ';'); // Escape commas
                }
            }
            // Escape quotes
            return `"${String(value || '').replace(/"/g, '""')}"`;
        }).join(','))
    ].join('\n');

    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
};

/**
 * Generate PDF Report with Table
 * @param {Array} data - Array of objects
 * @param {string} title - Report Title
 * @param {Array} columns - Array of column names to include
 */
export const exportToPDF = (data, title, columns = null) => {
    if (!data || !data.length) {
        alert("No data to export");
        return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Prepare Table Data
    const headers = columns || Object.keys(data[0]);
    const rows = data.map(row => headers.map(col => {
        let val = row[col];
        if (typeof val === 'object' && val?.seconds) {
            return new Date(val.seconds * 1000).toLocaleDateString();
        }
        if (typeof val === 'object') return JSON.stringify(val);
        return val || '';
    }));

    // Generate Table
    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
};
