import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // Check if user is admin (by email or user_metadata)
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
        <button type="submit">Login</button>
        {error && <div style={{color: 'red'}}>{error}</div>}
      </form>
    </div>
  );
}
