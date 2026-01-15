import Stripe from 'stripe';

export default async (req, res) => {
    if (req.method === 'POST') {
        const { tier, nNumber, successUrl, cancelUrl } = req.body;

        // 1. Check for real Stripe keys
        if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID_PRO) {
            try {
                const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

                const priceId = tier === 'basic'
                    ? process.env.STRIPE_PRICE_ID_BASIC
                    : process.env.STRIPE_PRICE_ID_PRO;

                // Create Checkout Session
                const session = await stripe.checkout.sessions.create({
                    line_items: [
                        {
                            price: priceId,
                            quantity: 1,
                        },
                    ],
                    mode: 'payment',
                    success_url: successUrl || `${req.headers.origin}/success?paid=true&tier=${tier}`,
                    cancel_url: cancelUrl || `${req.headers.origin}/`,
                    metadata: {
                        nNumber: nNumber,
                        tier: tier
                    },
                    // Optional: customize checkout look
                    submit_type: 'pay',
                    billing_address_collection: 'required',
                });

                // Return the real checkout URL
                return res.status(200).json({ id: session.id, url: session.url });

            } catch (err) {
                console.error("Stripe Error:", err);
                return res.status(500).json({ error: "Payment Gateway Error: " + err.message });
            }
        }

        // 2. Fallback: Simulation Mode (If no keys defined)
        console.warn("Using SIMULATION MODE (No Stripe Keys found)");
        const simulatedUrl = successUrl || `${req.headers.origin}/success?paid=true&tier=${tier}&nNumber=${nNumber}`;

        // Add a small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));

        res.status(200).json({
            id: 'sim_' + Date.now(),
            url: simulatedUrl
        });

    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};
