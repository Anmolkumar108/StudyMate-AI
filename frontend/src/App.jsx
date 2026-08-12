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

  // -------------------------
  // SIGNUP
  // -------------------------
  const handleSignup = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      setMessage("✅ " + data.message);

      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
      setError("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  