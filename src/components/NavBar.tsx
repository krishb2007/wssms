
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-amber-800 border-b border-amber-700 px-4 py-3 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-white hover:text-amber-200 transition-colors">
          Woodstock School
        </Link>
        <div className="flex items-center">
          <Link to="/admin-login">
            <Button 
              variant="outline" 
              size="sm"
              className="text-white border-white hover:text-amber-800 hover:bg-white transition-all duration-200 font-medium px-4 py-2 rounded-md"
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
