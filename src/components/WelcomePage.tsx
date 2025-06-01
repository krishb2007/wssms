
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface WelcomePageProps {
  nextStep: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ nextStep }) => {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Woodstock School</h1>
      <p className="text-gray-600">
        Thank you for visiting us. Please complete this registration form to continue.
      </p>
      <div className="pt-4 space-y-4">
        <Button onClick={nextStep} className="w-full">
          Begin Registration
        </Button>
        <div className="flex justify-center">
          <Link to="/admin-login">
            <Button variant="outline" className="w-full">
              Admin Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
