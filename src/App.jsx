import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Footer from './components/Footer';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/700.css';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background selection:bg-accent/30 flex flex-col">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/success" element={<Hero />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
