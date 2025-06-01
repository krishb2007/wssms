
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-800">
          Woodstock School
        </Link>
        <div className="flex space-x-2">
          <Link to="/admin-login">
            <Button variant="outline" size="sm">
              Admin Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
