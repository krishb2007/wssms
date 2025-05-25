import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from("visitor_registrations")
      .select("*");
    if (!error) setData(data || []);
  }

  function handleEdit(row: any) {
    setEditingId(row.id);
    setEditForm(row);
  }

  async function handleSave() {
    await supabase
      .from("visitor_registrations")
      .update(editForm)
      .eq("id", editingId);
    setEditingId(null);
    fetchData();
  }

  // Filtering
  const filtered = data.filter(row =>
    row.visitorname?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <input
        placeholder="Search names..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input input-bordered mb-4"
      />
      <table>
        <thead>
          <tr>
            {data[0] &&
              Object.keys(data[0]).map(key => <th key={key}>{key}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(row =>
            editingId === row.id ? (
              <tr key={row.id}>
                {Object.keys(row).map(k => (
                  <td key={k}>
                    <input
                      value={editForm[k] || ""}
                      onChange={e =>
                        setEditForm({ ...editForm, [k]: e.target.value })
                      }
                    />
                  </td>
                ))}
                <td>
                  <button onClick={handleSave}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={row.id}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{String(val)}</td>
                ))}
                <td>
                  <button onClick={() => handleEdit(row)}>Edit</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
