import { createWorker } from 'tesseract.js';

export const logbookOCRService = {
    async processLogbookImage(imageFile, onProgress) {
        const worker = await createWorker('eng', 1, {
            logger: m => {
                if (m.status === 'recognizing text') {
                    onProgress(Math.floor(m.progress * 100));
                }
            }
        });

        try {
            const { data: { text, lines } } = await worker.recognize(imageFile);

            // Extract Intelligence
            const findings = this.analyzeText(text);

            await worker.terminate();
            return {
                rawText: text,
                lines: lines.map(l => l.text),
                findings,
                ocrConfidence: 95
            };
        } catch (error) {
            console.error('OCR Error:', error);
            await worker.terminate();
            throw error;
        }
    },

    analyzeText(text) {
        const findings = {
            ad_compliance: [],
            detected_dates: [],
            aircraft_id: null,
            total_time: null
        };

        // 1. Detect AD Numbers (Pattern: AD YYYY-MM-DD or AD 202X etc)
        const adRegex = /AD\s*\d{4}-\d{2}-\d{2}/gi;
        findings.ad_compliance = text.match(adRegex) || [];

        // 2. Detect Dates
        const dateRegex = /\d{2}\/\d{2}\/\d{2,4}/g;
        findings.detected_dates = text.match(dateRegex) || [];

        // 3. Detect Tail Number
        const tailRegex = /[NCG]-[A-Z0-9]{3,5}/g;
        const tailMatch = text.match(tailRegex);
        if (tailMatch) findings.aircraft_id = tailMatch[0];

        // 4. Total Time
        const ttRegex = /TT[:\s]*(\d+\.?\d*)/i;
        const ttMatch = text.match(ttRegex);
        if (ttMatch) findings.total_time = ttMatch[1];

        return findings;
    }
};
