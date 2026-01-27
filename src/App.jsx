import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import RoleGateway from './components/RoleGateway';
import MinimalBuyerTest from './components/MinimalBuyerTest';
import SellerDashboardStandalone from './components/SellerDashboardStandalone';
import MechanicDashboardStandalone from './components/MechanicDashboardStandalone';
import VerificationGrid from './components/VerificationGrid';
import './index.css';

import { supabase } from './lib/supabaseClient';

function AuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // SYNC GUEST HISTORY
        const guestHistory = localStorage.getItem('guest_searches');
        if (guestHistory) {
          const history = JSON.parse(guestHistory);
          if (history.length > 0) {
            console.log('[Auth] Syncing guest history to user account:', history);
            const { error: insertError } = await supabase.from('user_searches').insert(
              history.map(tail => ({
                user_id: session.user.id,
                tail_number: tail
              }))
            );
            if (insertError) console.error('History sync failed:', insertError);
          }
          // Clear guest limit to unlock dashboard
          localStorage.removeItem('guest_searches');
        }

        // REDIRECT LOGIC
        // If we have a stored return path, go there.
        const returnPath = localStorage.getItem('redirect_after_login');
        if (returnPath) {
          localStorage.removeItem('redirect_after_login');
          navigate(returnPath);
        } else if (location.pathname === '/') {
          // If landing on root after login, default to Seller Dashboard
          navigate('/seller');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthHandler />
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<RoleGateway />} />
          <Route path="/buyer" element={<MinimalBuyerTest />} />
          <Route path="/seller" element={<SellerDashboardStandalone />} />
          <Route path="/mechanic" element={<MechanicDashboardStandalone />} />
          <Route path="/verify" element={<VerificationGrid />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
