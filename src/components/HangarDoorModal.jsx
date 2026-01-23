import React from 'react';
import { Shield, Lock, Plane, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function HangarDoorModal({ isOpen, searchHistory = [] }) {
    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    redirectTo: window.location.origin + '/buyer'
                }
            });
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed: ' + error.message);
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

                <button
                    onClick={handleGoogleLogin}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: '#fff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.23895)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.059 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.439 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                        </g>
                    </svg>
                    Continue with Google
                </button>

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
