import React, { useState } from 'react';
import { Shield, Lock, Plane, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function HangarDoorModal({ isOpen, searchHistory = [] }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleEmailLogin = async () => {
        // DEVELOPER BYPASS
        if (email.toLowerCase() === 'admin@gotailscan.com') {
            localStorage.removeItem('guest_searches');
            window.location.reload();
            return;
        }

        if (!email.includes('@')) {
            alert('Please enter a valid email.');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    // Redirect to Root (safer for whitelist)
                    emailRedirectTo: window.location.origin
                }
            });
            if (error) throw error;
            setMessage('Check your email (and Spam folder) for the login link!');
        } catch (error) {
            console.error('Login failed:', error);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1000px'
        }}>
            {/* Backdrop with Blur */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(2, 6, 23, 0.95)',
                backdropFilter: 'blur(10px)',
            }} />

            {/* Modal Content */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '500px',
                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                textAlign: 'center',
                overflow: 'hidden',
                animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Decorative Top Border (Hazard Stripe) */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #000 10px, #000 20px)'
                }} />

                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    border: '1px solid rgba(245, 158, 11, 0.2)'
                }}>
                    <Lock size={32} color="#f59e0b" />
                </div>

                <h2 style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    color: '#fff',
                    marginBottom: '12px',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    Hangar Access Restricted
                </h2>

                <p style={{
                    color: '#94a3b8',
                    marginBottom: '32px',
                    lineHeight: '1.6',
                    fontSize: '15px'
                }}>
                    You've hit the limit of guest searches. To analyze more aircraft and unlock <strong>Market Alpha</strong> insights, create your free account.
                </p>

                {/* Search History Recap */}
                {searchHistory.length > 0 && (
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '32px',
                        textAlign: 'left'
                    }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.05em' }}>
                            Saving your recent scans:
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {searchHistory.map((tail, i) => (
                                <span key={i} style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    color: '#e2e8f0',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    {tail}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '16px',
                            outline: 'none',
                            textAlign: 'center'
                        }}
                    />
                    <button
                        onClick={handleEmailLogin}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: loading ? '#94a3b8' : '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.02)')}
                        onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        {loading ? 'Sending Link...' : 'Continue with Email'}
                    </button>
                    {message && (
                        <p style={{ fontSize: '14px', color: '#10b981', marginTop: '8px' }}>
                            {message}
                        </p>
                    )}
                </div>

                <p style={{ marginTop: '20px', fontSize: '12px', color: '#64748b' }}>
                    <Shield size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                    Secure access powered by GoTailScan Identity
                </p>
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
