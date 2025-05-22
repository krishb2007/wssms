import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import UserHome from './UserHome';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">User Home</Link> |{' '}
        <Link to="/admin-login">Admin Login</Link>
      </nav>
      <Routes>
        <Route path="/" element={<UserHome />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
