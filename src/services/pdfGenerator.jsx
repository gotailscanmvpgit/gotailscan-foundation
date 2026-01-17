import React from 'react';
import { pdf } from '@react-pdf/renderer';
import DiligenceReportDocument from '../components/reports/ForensicReportTemplate';

export const generatePDFReport = async (tailNumber, data) => {
    try {
        // Create the document blob
        // Pass tailNumber into data object if not present, or as extra prop
        const reportData = { ...data, tail_number: tailNumber };

        const blob = await pdf(<DiligenceReportDocument data={reportData} />).toBlob();

        // Create a URL for the blob
        const url = URL.createObjectURL(blob);

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = `GoTailScan_Report_${tailNumber}_${Date.now()}.pdf`;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate report. Please try again.");
    }
};
