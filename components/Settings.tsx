import React, { useState } from "react";
import { chrome } from "chrome-extension-options";
import { validateGitHubToken } from "@/githubService";

interface SettingsProps {
  onTokenSave: (token: string) => void;
  onCancel: () => void;
  initialError?: string | null;
}

const Settings: React.FC<SettingsProps> = ({
  onTokenSave,
  onCancel,
  initialError,
}) => {
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(initialError || "");
  const [validating, setValidating] = useState(false);

  const handleSave = async () => {
    if (!token.trim()) {
      setError("Please enter a valid token");
      return;
    }

    setSaving(true);
    setValidating(true);
    
    try {
      // Validate the token before saving
      const isValid = await validateGitHubToken(token);
      
      if (!isValid) {
        setError("Invalid GitHub token. Please check and try again.");
        setSaving(false);
        setValidating(false);
        return;
      }
      
      // Token is valid, proceed with saving
      onTokenSave(token);
    } catch (err) {
      setError("Failed to validate or save token");
      console.error(err);
    } finally {
      setSaving(false);
      setValidating(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>GitHub Settings</h2>
        <button
          onClick={onCancel}
          style={{
            padding: "4px 8px",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#57606a",
          }}
        >
          ✕
        </button>
      </div>

      {initialError && (
        <div
          style={{
            color: "#cf222e",
            padding: "8px",
            backgroundColor: "#ffebe9",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          {initialError}
        </div>
      )}

      <div
        style={{
          backgroundColor: "#f6f8fa",
          border: "1px solid #d0d7de",
          borderRadius: "6px",
          padding: "12px",
          fontSize: "14px",
          marginBottom: "8px",
        }}
      >
        <h4 style={{ margin: "0 0 8px 0" }}>How to generate a token:</h4>
        <ol style={{ margin: 0, paddingLeft: "20px" }}>
          <li>
            Go to GitHub Settings → Developer Settings → Personal Access Tokens
            → Tokens (classic)
          </li>
          <li>Click "Generate new token (classic)"</li>
          <li>
            Select the{" "}
            <code
              style={{
                backgroundColor: "#eaeef2",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              repo
            </code>{" "}
            scope for private repository access
          </li>
          <li>Generate and copy the token</li>
        </ol>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label htmlFor="token">GitHub Personal Access Token</label>
        <input
          id="token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #d0d7de",
            fontSize: "14px",
          }}
          placeholder="ghp_..."
        />
        <small style={{ color: "#57606a" }}>
          Token requires{" "}
          <code
            style={{
              backgroundColor: "#f6f8fa",
              padding: "2px 4px",
              borderRadius: "3px",
            }}
          >
            repo
          </code>{" "}
          scope for private repository access
        </small>
      </div>

      {error && !initialError && (
        <div style={{ color: "#cf222e" }}>{error}</div>
      )}

      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "flex-end",
          marginTop: "8px",
        }}
      >
        <button
          onClick={onCancel}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid #d0d7de",
            backgroundColor: "#ffffff",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !token}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid #d0d7de",
            backgroundColor: "#2da44e",
            color: "#ffffff",
            cursor: saving || !token ? "not-allowed" : "pointer",
            opacity: saving || !token ? 0.7 : 1,
          }}
        >
          {validating ? "Validating..." : saving ? "Saving..." : "Save Token"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
