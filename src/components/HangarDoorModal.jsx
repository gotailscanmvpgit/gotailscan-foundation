import React, { useState } from 'react';
import { Shield, Lock, Plane, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function HangarDoorModal({ isOpen, searchHistory = [], onClose }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleEmailLogin = async () => {
        // DEVELOPER BYPASS
        if (email.toLowerCase() === 'admin@gotailscan.com' || email.toLowerCase() === 'seller@gotailscan.com') {
            localStorage.setItem('demo_mode', 'true');
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
            perspective: '1000px',
            fontFamily: '"Inter", sans-serif'
        }}>
            {/* Dark Cinematic Backdrop */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(2, 6, 23, 0.85)',
                backdropFilter: 'blur(16px)',
                transition: 'all 0.5s ease'
            }} />

            {/* Modal Container */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '480px',
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '0',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 20px 40px -10px rgba(0,0,0,0.5)',
                textAlign: 'center',
                overflow: 'hidden',
                animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Close Button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            zIndex: 20
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <Search size={16} style={{ transform: 'rotate(45deg)' }} />
                    </button>
                )}

                {/* Premium Header Section */}
                <div style={{
                    padding: '40px 40px 32px',
                    background: 'radial-gradient(circle at top center, rgba(16, 185, 129, 0.15), transparent 70%)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 78, 59, 0.2))',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
                    }}>
                        <Lock size={28} className="text-emerald-400" />
                    </div>

                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: '800',
                        color: 'white',
                        marginBottom: '12px',
                        letterSpacing: '-0.02em'
                    }}>
                        Unlock Full Hangar Access
                    </h2>

                    <p style={{
                        color: '#94a3b8',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        maxWidth: '320px',
                        margin: '0 auto'
                    }}>
                        You've reached the guest limit. Sign in to analyze unlimited aircraft and access <span style={{ color: '#10b981', fontWeight: 'bold' }}>Market Alpha</span> insights.
                    </p>
                </div>

                {/* Content Body */}
                <div style={{ padding: '32px 40px' }}>

                    {/* Search History Chips */}
                    {searchHistory.length > 0 && (
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                marginBottom: '12px'
                            }}>
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></div>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '1px' }}>
                                    Secure Your Data
                                </div>
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                {searchHistory.map((tail, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        opacity: 0.8
                                    }}>
                                        <Plane size={10} className="text-slate-500" />
                                        <span style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600', fontFamily: 'monospace' }}>
                                            {tail}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '16px 16px 16px 48px',
                                    background: 'rgba(2, 6, 23, 0.4)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#10b981';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                <Shield size={18} className="text-slate-500" />
                            </div>
                        </div>

                        <button
                            onClick={handleEmailLogin}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: loading ? '#334155' : 'linear-gradient(135deg, #eee, #fff)',
                                color: loading ? '#94a3b8' : '#020617',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '700',
                                fontSize: '15px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: loading ? 'none' : '0 4px 12px rgba(255, 255, 255, 0.15)'
                            }}
                            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                            onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {loading ? 'Sending Magic Link...' : 'Continue with Email'}
                        </button>
                    </div>

                    {message && (
                        <div style={{
                            marginTop: '20px',
                            padding: '12px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                            fontSize: '13px',
                            fontWeight: '500'
                        }}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px',
                    background: 'rgba(0,0,0,0.2)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '12px',
                    color: '#64748b'
                }}>
                    Protected by Enterprise-Grade Security
                </div>
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: scale(0.95) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
