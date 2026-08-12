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

  // -------------------------
  // LOGIN
  // -------------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Save logged-in user
      setUser(data.user);

      // Open dashboard
      setIsLoggedIn(true);

      localStorage.setItem(
        "studymate_user",
        JSON.stringify(data.user)
      );

      setMessage("");
      setError("");

      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
      setError("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  const handleLogout = () => {
    localStorage.removeItem("studymate_user");

    setIsLoggedIn(false);
    setUser(null);
    setShowLogin(true);
    setMessage("");
    setError("");
  };

  // -------------------------
  // DASHBOARD
  // -------------------------
  if (isLoggedIn) {
    return (
      <div>
        <h1>StudyMate AI</h1>

        <p>Student Productivity Platform</p>

        <h2>Welcome, {user?.name}! 👋</h2>

        <p>You are successfully logged in.</p>

        <hr />

        <h3>📚 Study Dashboard</h3>

        <p>Tasks: Coming Soon</p>
        <p>📝 Notes: Coming Soon</p>
        <p>📅 Study Planner: Coming Soon</p>
        <p>🤖 AI Study Assistant: Coming Soon</p>

        <br />

        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  // -------------------------
  // SIGNUP / LOGIN
  // -------------------------
  return (
    <div>
      <h1>StudyMate AI</h1>

      <p>Student Productivity Platform</p>

      {!showLogin ? (
        <>
          <h2>Create Account</h2>

          <form onSubmit={handleSignup}>
            <div>
              <label>Name</label>
              <br />

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <br />

            <div>
              <label>Email</label>
              <br />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <br />

            <div>
              <label>Password</label>
              <br />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <br />

            <button type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <br />

          <button
            onClick={() => {
              setShowLogin(true);
              setMessage("");
              setError("");
            }}
          >
            Already have an account? Login
          </button>
        </>
      ) : (
        <>
          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <div>
              <label>Email</label>
              <br />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <br />

            <div>
              <label>Password</label>
              <br />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <br />

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <br />

          <button
            onClick={() => {
              setShowLogin(false);
              setMessage("");
              setError("");
            }}
          >
            Don't have an account? Sign Up
          </button>
        </>
      )}

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}
    </div>
  );
}

export default App;