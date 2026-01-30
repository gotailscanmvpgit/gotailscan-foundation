import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleGateway from './components/RoleGateway';
import StandaloneBuyerDashboard from './components/StandaloneBuyerDashboard';
import SellerDashboardStandalone from './components/SellerDashboardStandalone';
import MechanicDashboardStandalone from './components/MechanicDashboardStandalone';
import MinimalBuyerTest from './components/MinimalBuyerTest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleGateway />} />
        <Route path="/buyer" element={<MinimalBuyerTest />} />
        <Route path="/buyer-test" element={<StandaloneBuyerDashboard />} />
        <Route path="/seller" element={<SellerDashboardStandalone />} />
        <Route path="/mechanic" element={<MechanicDashboardStandalone />} />
      </Routes>
    </Router>
  );
}

export default App;
