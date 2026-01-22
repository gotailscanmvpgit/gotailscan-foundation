import { useNavigate } from 'react-router-dom';

export default function SimpleGateway() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at center, #1a1a1a 0%, #0A0A0A 100%)', position: 'relative', overflow: 'hidden' }}>
            {/* Animated Background Grid */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '4rem 4rem',
                animation: 'grid-pulse 8s ease-in-out infinite'
            }}></div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 10 }}>
                {/* Logo & Header */}
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '24px' }}>
                        {/* Logo */}
                        <div style={{
                            fontSize: '48px',
                            background: 'linear-gradient(135deg, #FF5F1F 0%, #FF8F5F 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 20px rgba(255, 95, 31, 0.3))'
                        }}>
                            ✈️
                        </div>
                        <div>
                            <div style={{
                                fontSize: '10px',
                                color: '#FF5F1F',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '3px',
                                marginBottom: '4px',
                                fontFamily: 'Michroma, sans-serif'
                            }}>
                                Aircraft Background Checks
                            </div>
                            <h1 style={{
                                fontSize: '56px',
                                fontWeight: '900',
                                background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                margin: 0,
                                fontFamily: 'Michroma, sans-serif'
                            }}>
                                GoTailScan
                            </h1>
                        </div>
                    </div>
                    <p style={{
                        fontSize: '20px',
                        color: '#9ca3af',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        Know what you're buying, selling, or signing off on
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '60px' }}>
                    {/* Buyer Card */}
                    <div
                        onClick={() => navigate('/buyer')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            borderRadius: '16px',
                            padding: '32px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                            e.currentTarget.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.05), transparent 70%)',
                            pointerEvents: 'none'
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '24px',
                                border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}>
                                <span style={{ fontSize: '32px' }}>🛡️</span>
                            </div>

                            <h2 style={{
                                fontSize: '28px',
                                fontWeight: '900',
                                color: 'white',
                                textTransform: 'uppercase',
                                marginBottom: '8px',
                                letterSpacing: '1px'
                            }}>
                                I'm Buying
                            </h2>

                            <div style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#10b981',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                marginBottom: '16px'
                            }}>
                                Pre-Buy Intelligence
                            </div>

                            <p style={{
                                fontSize: '15px',
                                color: '#9ca3af',
                                lineHeight: '1.6',
                                marginBottom: '24px'
                            }}>
                                Find the red flags before you write the check
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>
                                <span>Enter Console</span>
                                <span>→</span>
                            </div>
                        </div>
                    </div>

                    {/* Seller Card */}
                    <div
                        onClick={() => navigate('/seller')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '16px',
                            padding: '32px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                            e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.05), transparent 70%)',
                            pointerEvents: 'none'
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '24px',
                                border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}>
                                <span style={{ fontSize: '32px' }}>💎</span>
                            </div>

                            <h2 style={{
                                fontSize: '28px',
                                fontWeight: '900',
                                color: 'white',
                                textTransform: 'uppercase',
                                marginBottom: '8px',
                                letterSpacing: '1px'
                            }}>
                                I'm Selling
                            </h2>

                            <div style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#3b82f6',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                marginBottom: '16px'
                            }}>
                                Seller's Toolkit
                            </div>

                            <p style={{
                                fontSize: '15px',
                                color: '#9ca3af',
                                lineHeight: '1.6',
                                marginBottom: '24px'
                            }}>
                                Show buyers why your plane is worth every penny
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '14px', fontWeight: 'bold' }}>
                                <span>Enter Console</span>
                                <span>→</span>
                            </div>
                        </div>
                    </div>

                    {/* Mechanic Card */}
                    <div
                        onClick={() => navigate('/mechanic')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 95, 31, 0.2)',
                            borderRadius: '16px',
                            padding: '32px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = 'rgba(255, 95, 31, 0.4)';
                            e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 95, 31, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255, 95, 31, 0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle at top right, rgba(255, 95, 31, 0.05), transparent 70%)',
                            pointerEvents: 'none'
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(255, 95, 31, 0.1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '24px',
                                border: '1px solid rgba(255, 95, 31, 0.2)'
                            }}>
                                <span style={{ fontSize: '32px' }}>⚙️</span>
                            </div>

                            <h2 style={{
                                fontSize: '28px',
                                fontWeight: '900',
                                color: 'white',
                                textTransform: 'uppercase',
                                marginBottom: '8px',
                                letterSpacing: '1px'
                            }}>
                                I'm a Mechanic
                            </h2>

                            <div style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#FF5F1F',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                marginBottom: '16px'
                            }}>
                                A&P Toolkit
                            </div>

                            <p style={{
                                fontSize: '15px',
                                color: '#9ca3af',
                                lineHeight: '1.6',
                                marginBottom: '24px'
                            }}>
                                Quick logbook check and AD status for pre-buys
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF5F1F', fontSize: '14px', fontWeight: 'bold' }}>
                                <span>Enter Console</span>
                                <span>→</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Value Props */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '24px',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}>
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            background: 'rgba(255, 95, 31, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            border: '1px solid rgba(255, 95, 31, 0.2)'
                        }}>
                            <span style={{ fontSize: '24px' }}>🔍</span>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                            We Check Everything
                        </h3>
                        <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                            Accident history, liens, sanctions, and 12+ databases
                        </p>
                    </div>

                    <div style={{ textAlign: 'center', padding: '24px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            background: 'rgba(255, 95, 31, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            border: '1px solid rgba(255, 95, 31, 0.2)'
                        }}>
                            <span style={{ fontSize: '24px' }}>🧠</span>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                            Smart Analysis
                        </h3>
                        <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                            AI reads the logs and spots issues humans miss
                        </p>
                    </div>

                    <div style={{ textAlign: 'center', padding: '24px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            background: 'rgba(255, 95, 31, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            border: '1px solid rgba(255, 95, 31, 0.2)'
                        }}>
                            <span style={{ fontSize: '24px' }}>✓</span>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                            Know Before You Go
                        </h3>
                        <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                            Get the full story before you buy, sell, or sign off
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
