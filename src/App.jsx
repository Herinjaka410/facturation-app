import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import WorkPage from './components/WorkPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/work" element={<WorkPage />} />
      </Routes>
    </Router>
  );
}

export default App;