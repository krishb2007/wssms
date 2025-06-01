
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
              variant="ghost" 
              size="sm"
              className="text-white bg-blue-600 hover:bg-blue-700 hover:text-white border-0 transition-all duration-200 font-medium px-4 py-2 rounded-md shadow-sm"
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
