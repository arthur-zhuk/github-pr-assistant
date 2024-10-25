import React, { useState } from "react";

interface SettingsProps {
  onTokenSave: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onTokenSave }) => {
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await chrome.storage.sync.set({ githubToken: token });
      onTokenSave();
    } catch (error) {
      console.error("Error saving token:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">GitHub Token Required</h2>
      <p className="mb-4">
        Please enter your GitHub personal access token to continue.
      </p>
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        placeholder="ghp_your_token_here"
      />
      <button
        onClick={handleSave}
        disabled={saving || !token}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        {saving ? "Saving..." : "Save Token"}
      </button>
    </div>
  );
};

export default Settings;
