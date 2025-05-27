import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Entry {
  id: number;
  name: string;
  email: string;
  // Add other fields as per your Supabase table
}

export default function AdminDashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Entry>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Ensure only signed-in admins can access this page
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmails = ['admin@example.com']; // <-- replace with your admin email(s)
      if (!user || !adminEmails.includes(user.email!)) {
        navigate('/admin-login');
      }
    })();
  }, [navigate]);

  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line
  }, []);

  async function fetchEntries() {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('entries').select('*');
    if (error) {
      setError(error.message);
    } else if (data) {
      setEntries(data);
    }
    setLoading(false);
  }

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setEditForm(entry);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function saveEdit() {
    if (!editingId) return;
    setError('');
    const { error } = await supabase
      .from('entries')
      .update(editForm)
      .eq('id', editingId);

    if (error) {
      setError(error.message);
    } else {
      setEditingId(null);
      setEditForm({});
      fetchEntries();
    }
  }

  if (loading) return <div>Loading entries...</div>;

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            {/* Add other column headers as per your Supabase table */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry =>
            editingId === entry.id ? (
              <tr key={entry.id}>
                <td>
                  <input
                    name="name"
                    value={editForm.name || ''}
                    onChange={handleChange}
                  />
                </td>
                <td>
                  <input
                    name="email"
                    value={editForm.email || ''}
                    onChange={handleChange}
                  />
                </td>
                {/* Add other fields here */}
                <td>
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={entry.id}>
                <td>{entry.name}</td>
                <td>{entry.email}</td>
                {/* Add other fields here */}
                <td>
                  <button onClick={() => startEdit(entry)}>Edit</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
