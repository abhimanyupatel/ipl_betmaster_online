import { useMemo, useState } from "react";

function Card({ children }) {
  return (
    <div className="auth-card">
      {children}
    </div>
  );
}

export default function AuthGate({ auth, children }) {
  const [email, setEmail] = useState("");
  const [loginMode, setLoginMode] = useState("magic"); // default
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const emailPrefix = useMemo(() => email.split("@")[0] || "", [email]);

  if (auth.loading) {
    return (
      <div className="center-screen">
        <Card>
          <div className="brand-mark">🏏</div>
          <div className="brand-title">IPL BETMASTER</div>
          <div className="muted">Loading session…</div>
        </Card>
      </div>
    );
  }

  if (!auth.user) {
    const submitAuth = async (event) => {
      event.preventDefault();
      setError("");
      setSubmitting(true);
      try {
        if (loginMode === "magic") {
          await auth.signInWithOtp(email.trim());
        } else {
          await auth.signInWithPassword(email.trim(), password);
        }
      } catch (err) {
        setError(
          err.message ||
            (loginMode === "magic" ? "Could not send login link" : "Could not sign in")
        );
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="center-screen">
        <Card>
          <div className="brand-mark">🏏</div>
          <div className="brand-title">IPL BETMASTER</div>
          <div className="brand-subtitle">Prediction League</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center" }}>
            <button
              type="button"
              className={`tab-btn ${loginMode === "magic" ? "tab-btn-active" : ""}`}
              onClick={() => {
                setError("");
                setLoginMode("magic");
              }}
              disabled={submitting}
            >
              Magic link
            </button>
            <button
              type="button"
              className={`tab-btn ${loginMode === "password" ? "tab-btn-active" : ""}`}
              onClick={() => {
                setError("");
                setLoginMode("password");
              }}
              disabled={submitting}
            >
              Password
            </button>
          </div>

          <form className="stack" onSubmit={submitAuth}>
            <label className="label">Email address</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            {loginMode === "password" ? (
              <>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </>
            ) : null}
            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting
                ? loginMode === "magic"
                  ? "Sending…"
                  : "Signing in…"
                : loginMode === "magic"
                  ? "Send magic link"
                  : "Sign in"}
            </button>
          </form>
          {auth.message ? <div className="success-box">{auth.message}</div> : null}
          {error ? <div className="error-box">{error}</div> : null}
        </Card>
      </div>
    );
  }

  if (!auth.profile) {
    if (auth.profileLoading) {
      return (
        <div className="center-screen">
          <Card>
            <div className="brand-title">Loading profile…</div>
            <div className="muted">Fetching your league identity.</div>
          </Card>
        </div>
      );
    }

    if (auth.profileError) {
      const retryProfile = async () => {
        setError("");
        try {
          await auth.refreshProfile?.();
        } catch (err) {
          setError(err.message || "Could not retry profile load");
        }
      };

      return (
        <div className="center-screen">
          <Card>
            <div className="brand-title">Profile unavailable</div>
            <div className="muted">{auth.profileError}</div>
            <div style={{ height: 12 }} />
            <button className="primary-btn" type="button" onClick={retryProfile} disabled={auth.profileLoading}>
              Retry
            </button>
            {error ? <div className="error-box">{error}</div> : null}
          </Card>
        </div>
      );
    }

    const submitProfile = async (event) => {
      event.preventDefault();
      setError("");
      setSubmitting(true);
      try {
        await auth.bootstrapProfile({
          username: username.trim() || emailPrefix.trim(),
          displayName: displayName.trim(),
        });
      } catch (err) {
        setError(err.message || "Could not create profile");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="center-screen">
        <Card>
          <div className="brand-title">Complete profile</div>
          <div className="muted">Create your league identity before placing picks.</div>
          <form className="stack" onSubmit={submitProfile}>
            <label className="label">Username</label>
            <input
              className="input"
              value={username}
              onChange={(event) => setUsername(event.target.value.replace(/\s+/g, "-"))}
              placeholder={emailPrefix || "abhi"}
              required
            />
            <label className="label">Display name</label>
            <input
              className="input"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Abe"
              required
            />
            <button className="primary-btn" type="submit" disabled={submitting || auth.profileLoading}>
              {submitting || auth.profileLoading ? "Saving…" : "Finish setup"}
            </button>
          </form>
          {error ? <div className="error-box">{error}</div> : null}
        </Card>
      </div>
    );
  }

  return children;
}
