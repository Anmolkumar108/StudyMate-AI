import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // Signup states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Common states
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Page states
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Logged-in user
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("studymate_user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  