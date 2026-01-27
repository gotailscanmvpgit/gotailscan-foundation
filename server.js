import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import createCheckoutSession from './api/create-checkout-session.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Route for creating checkout session
app.post('/api/create-checkout-session', createCheckoutSession);

import arlaHandler from './api/arla.js';
app.get('/api/arla', arlaHandler);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
