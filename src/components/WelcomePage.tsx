import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Woodstock School</h1>
      <p className="text-gray-600">
        Thank you for visiting us. Please complete this registration form to continue.
      </p>
      <div className="pt-4">
        <Button onClick={() => navigate("/register")} className="w-full">
          Begin Registration
        </Button>
      </div>
    </div>
  );
};

export default WelcomePage;
