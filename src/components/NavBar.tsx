
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const NavBar: React.FC = () => {
  return (
    <nav className="px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
          Woodstock School
        </Link>
        <div className="flex items-center">
          <Link to="/admin-login">
            <Button 
              variant="outline" 
              size="sm"
              className="text-white bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-all duration-200 font-medium px-4 py-2 rounded-md"
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
