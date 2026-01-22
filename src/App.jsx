import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleGateway from './components/RoleGateway';
import MinimalBuyerTest from './components/MinimalBuyerTest';
import SellerDashboardStandalone from './components/SellerDashboardStandalone';
import MechanicDashboardStandalone from './components/MechanicDashboardStandalone';
import VerificationGrid from './components/VerificationGrid';
import './index.css';

function App() {
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
