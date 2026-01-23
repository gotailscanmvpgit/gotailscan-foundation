import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleGateway from './components/RoleGateway';
import MinimalBuyerTest from './components/MinimalBuyerTest';
import SellerDashboardStandalone from './components/SellerDashboardStandalone';
import MechanicDashboardStandalone from './components/MechanicDashboardStandalone';
import VerificationGrid from './components/VerificationGrid';
import './index.css';

import { useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

function App() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // SYNC GUEST HISTORY
        const guestHistory = localStorage.getItem('guest_searches');
        if (guestHistory) {
          const history = JSON.parse(guestHistory);
          if (history.length > 0) {
            console.log('[Auth] Syncing guest history to user account:', history);
            // TODO: Call backend to persist history: supabase.from('user_searches').insert(...)
          }
          // Clear guest limit to unlock dashboard
          localStorage.removeItem('guest_searches');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
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
