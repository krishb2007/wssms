
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AdminHeaderProps {
  userEmail?: string;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userEmail, onLogout }) => (
  <div className="bg-gradient-to-r from-amber-800 to-amber-900 shadow-xl rounded-xl p-6 mb-6 border border-amber-700">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Visitor Management System
        </h1>
        <p className="text-amber-200 text-lg font-semibold">Monitor and Manage Visitor Registration</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm text-amber-200 font-medium">Signed in as</p>
          <p className="font-bold text-white">{userEmail}</p>
        </div>
        <Button 
          onClick={onLogout} 
          variant="outline"
          className="flex items-center space-x-2 bg-white text-amber-800 hover:bg-amber-50 border-2 border-white font-bold"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  </div>
);
