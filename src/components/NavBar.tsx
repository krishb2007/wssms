
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-amber-900 border-b border-amber-800 px-4 py-3 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-white hover:text-amber-200 transition-colors">
          Woodstock School
        </Link>
        <div className="flex items-center space-x-3">
          <Link to="/exit">
            <Button 
              variant="outline" 
              size="sm"
              className="text-white bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700 transition-all duration-200 font-medium px-4 py-2 rounded-md"
            >
              Exit
            </Button>
          </Link>
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
