import { useState } from "react";
import "./Auth.css";

function Signup({
  onSignup,
  onSwitchToLogin,
  loading = false,
  error = "",
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    onSignup({
      username: username.trim(),
      email: email.trim(),
      password,
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-background-glow auth-glow-one"></div>
      <div className="auth-background-glow auth-glow-two"></div>

      <div className="auth-container signup-mode">

        {/* Signup Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">

            <div className="auth-brand">
              <span className="auth-brand-icon">S</span>

              <div>
                <strong>StudyMate AI</strong>
                <span>StudentOS</span>
              </div>
            </div>

            <div className="auth-heading">
              <span className="auth-eyebrow">START YOUR JOURNEY</span>

              <h2>Create Account</h2>

              <p>
                Create your StudyMate AI account and start
                learning smarter.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">

              {/* Username */}
              <div className="auth-input-group">
                <label htmlFor="signup-username">
                  Username
                </label>

                <div className="auth-input-wrapper">
                  <span className="input-icon">◉</span>

                  <input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="auth-input-group">
                <label htmlFor="signup-email">
                  Email
                </label>

                <div className="auth-input-wrapper">
                  <span className="input-icon">@</span>

                  <input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <label htmlFor="signup-password">
                  Password
                </label>

                <div className="auth-input-wrapper">
                  <span className="input-icon">◆</span>

                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="auth-input-group">
                <label htmlFor="signup-confirm-password">
                  Confirm Password
                </label>

                <div className="auth-input-wrapper">
                  <span className="input-icon">◆</span>

                  <input
                    id="signup-confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? "◉" : "◌"}
                  </button>
                </div>
              </div>

              {password &&
                confirmPassword &&
                password !== confirmPassword && (
                  <div className="auth-error">
                    Passwords do not match.
                  </div>
                )}

              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              <label className="terms-checkbox">
                <input type="checkbox" required />

                <span>
                  I agree to the Terms of Service and Privacy
                  Policy.
                </span>
              </label>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={
                  loading ||
                  password !== confirmPassword
                }
              >
                <span>
                  {loading
                    ? "Creating account..."
                    : "Create Account"}
                </span>

                {!loading && (
                  <span className="button-arrow">→</span>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="auth-social-row">
              <button
                type="button"
                className="social-button"
              >
                <span>G</span>
                Google
              </button>

              <button
                type="button"
                className="social-button"
              >
                <span>⌘</span>
                GitHub
              </button>
            </div>

            <p className="auth-switch">
              Already have an account?

              <button
                type="button"
                onClick={onSwitchToLogin}
              >
                Login
              </button>
            </p>

          </div>
        </div>

        {/* Welcome Panel */}
        <div className="auth-welcome-panel">
          <div className="welcome-content">

            <div className="brand-mark">
              <span>✦</span>
            </div>

            <p className="welcome-small">
              WELCOME TO STUDYMATE
            </p>

            <h1>
              Your learning.
              <br />
              Your progress.
              <br />
              Your future.
            </h1>

            <p className="welcome-description">
              Organize your studies, manage your tasks,
              track your progress and learn with your
              personal AI assistant.
            </p>

            <div className="welcome-features">
              <span>✦ Smart Study Planning</span>
              <span>✦ AI Learning Assistant</span>
              <span>✦ Progress Tracking</span>
            </div>

            <div className="welcome-line"></div>

          </div>
        </div>

        {/* Animated Diagonal Layer */}
        <div className="auth-diagonal-panel">
          <div className="diagonal-glow"></div>
        </div>

      </div>

      <div className="auth-footer">
        <span>
          © {new Date().getFullYear()} StudyMate AI
        </span>

        <span>
          Built for better learning.
        </span>
      </div>
    </div>
  );
}

export default Signup;