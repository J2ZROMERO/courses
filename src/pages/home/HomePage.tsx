// src/pages/HomePage.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return <div className="container py-5"></div>;
}
