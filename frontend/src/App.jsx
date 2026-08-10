import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkBackend = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/");

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setError("Backend se connection nahi ho pa raha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>StudyMate AI</h1>

      <p>Student Productivity Platform</p>

      <button onClick={checkBackend} disabled={loading}>
        {loading ? "Connecting..." : "Test Backend Connection"}
      </button>

      {message && (
        <p>
          Backend Response: <strong>{message}</strong>
        </p>
      )}

      {error && (
        <p>
          ❌ {error}
        </p>
      )}
    </div>
  );
}

export default App;