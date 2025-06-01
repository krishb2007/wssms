
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
          Woodstock School
        </Link>
        <div className="flex items-center">
          <Link to="/admin-login">
            <Button 
              variant="outline" 
              size="sm"
              className="text-gray-700 border-gray-300 bg-gray-50 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm"
            >
              Admin Access
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
