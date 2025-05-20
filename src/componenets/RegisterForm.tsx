import React, { useState } from "react";
import { signUp } from "@/services/authService";

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState({ city: "", state: "", country: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, { name, phoneNumber, address });
      // Redirect or show success
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* fields for email, password, name, phoneNumber, address */}
    </form>
  );
}

export default RegisterForm;
