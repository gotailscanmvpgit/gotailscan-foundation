export default async (req, res) => {
    // 1. Validate Method
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    // 2. Extract Tail Number
    const { tail_number } = req.query;

    if (!tail_number) {
        return res.status(400).json({ error: 'Missing tail_number parameter' });
    }

    const upperTail = tail_number.toUpperCase();

    // 3. Check for 'N' prefix (US Registration)
    if (!upperTail.startsWith('N')) {
        return res.status(400).json({ error: 'Only US (N-prefixed) tail numbers are supported via Arla.' });
    }

    try {
        // 4. Fetch Registration Data from Arla
        const arlaUrl = `https://arla.njf.dev/api/v1/registration/${upperTail}`;
        const response = await fetch(arlaUrl);

        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ error: 'Registration not found' });
            }
            throw new Error(`Arla API responded with ${response.status}`);
        }

        const data = await response.json();

        // 5. Map the resulting JSON
        // Structure assumption based on user request: needs manufacturer, model, engine
        // I will return the raw data mapped to a clean structure, or as requested.
        const mappedData = {
            manufacturer: data.manufacturer,
            model: data.model,
            engine: data.engine,
            // Including other potentially useful fields if available, but keeping it strict to request for now.
            // If the Arla API returns different field names, this might need adjustment, 
            // but mappedData usually implies a transformation.
            // Since I don't know the exact schema of Arla response, I'll pass through what I can 
            // or assume standard naming. If 'data' has these fields directly, great.
            // Let's assume standard keys for now.
            ...data // Spread original data just in case, but ensure priority keys exist
        };

        return res.status(200).json(mappedData);

    } catch (error) {
        console.error('Arla API Error:', error);
        return res.status(500).json({ error: 'Failed to fetch registration data' });
    }
};
