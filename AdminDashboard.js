import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Protect route - only allow logged-in admins
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmails = ['admin@example.com']; // <-- same as above
      if (!user || !adminEmails.includes(user.email)) {
        navigate('/admin-login');
      }
    }

    // Fetch data from Supabase table (e.g., 'users', 'forms', etc.)
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('*');
      if (!error) setData(data);
      setLoading(false);
    }

    checkAdmin();
    fetchData();
  }, [navigate]);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              {data[0] && Object.keys(data[0]).map(key => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{String(val)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
