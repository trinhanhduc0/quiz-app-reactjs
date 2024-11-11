// src/components/Logout.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TokenService from "~/services/TokenService";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    TokenService.removeToken(); // Remove token
    navigate("/login"); // Redirect to login page
  }, [navigate]);

  return null; // No UI needed for this component
};

export default Logout;