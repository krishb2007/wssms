
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { RefreshCw } from "lucide-react";
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatsCards } from '@/components/admin/StatsCards';
import { VisitorsTable } from '@/components/admin/VisitorsTable';
import { useVisitorRegistrations } from '@/hooks/useVisitorRegistrations';
import { useEditRegistration } from '@/hooks/useEditRegistration';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    registrations,
    filteredRegistrations,
    loading,
    searchTerm,
    setSearchTerm,
    fetchRegistrations,
    updateRegistration
  } = useVisitorRegistrations();

  const {
    editingId,
    editEndTime,
    saving,
    startEdit,
    cancelEdit,
    saveEdit,
    setEditEndTime
  } = useEditRegistration(updateRegistration);

  useEffect(() => {
    console.log("AdminDashboard useEffect - checking user:", user);
    if (!user || user.role !== 'admin') {
      console.log("User not admin, redirecting to login");
      navigate('/admin-login');
      return;
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <RefreshCw className="mx-auto h-12 w-12 animate-spin text-amber-500 mb-4" />
          <p className="text-white font-bold text-xl">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <AdminHeader userEmail={user?.email} onLogout={handleLogout} />
        <StatsCards registrations={registrations} />
        <VisitorsTable
          registrations={registrations}
          filteredRegistrations={filteredRegistrations}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={fetchRegistrations}
          editingId={editingId}
          editEndTime={editEndTime}
          saving={saving}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveEdit}
          onEditEndTimeChange={setEditEndTime}
        />
      </div>
    </div>
  );
}
