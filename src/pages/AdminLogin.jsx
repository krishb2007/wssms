import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../App'; // adjust path if your AuthContext is exported elsewhere

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // get user from context

  // If already logged in as admin, redirect to dashboard
  if (user && user.role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Check if user is admin (by email or user_metadata, you can adjust as needed)
    const adminEmails = ['admin@example.com']; // <-- replace with your admin email(s)
    if (!adminEmails.includes(email)) {
      setError('You are not authorized as admin.');
      await supabase.auth.signOut();
      return;
    }

    // Redirect to dashboard
    navigate('/admin-dashboard');
  }

  return (
    <div>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div style={{color: 'red'}}>{error}</div>}
      </form>
    </div>
  );
}
