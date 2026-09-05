import { useState } from "react";

function Login({ onLogin, onSwitchToSignup, loading, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    onLogin({
      email,
      password,
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="auth-container">
        <div className="auth-brand">
          <div className="brand-icon">✦</div>
          <h1>StudyMate <span>AI</span></h1>
          <p>Your intelligent StudentOS</p>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <p className="auth-eyebrow">WELCOME BACK</p>
            <h2>Sign in to your account</h2>
            <p>Continue your learning journey with StudyMate AI.</p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email</label>

              <div className="input-wrapper">
                <span className="input-icon">✉</span>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>

              <div className="input-wrapper">
                <span className="input-icon">⌁</span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="auth-divider">
            <span>NEW TO STUDYMATE?</span>
          </div>

          <button
            className="auth-switch"
            onClick={onSwitchToSignup}
          >
            Create an account
          </button>
        </div>

        <p className="auth-footer">
          Built for students who want to learn smarter.
        </p>
      </div>
    </div>
  );
}

export default Login;