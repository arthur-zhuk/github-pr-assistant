"use client";

import React, { useEffect, useState } from "react";
import SuggestionBox from "../../components/SuggestionBox";
import Settings from "../../components/Settings";
import { fetchPullRequestDiff } from "../../githubService";

const ExtensionPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentPrUrl, setCurrentPrUrl] = useState<string | null>(null);

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const { githubToken } = await chrome.storage.sync.get("githubToken");
      if (githubToken) {
        setToken(githubToken);
      } else {
        setShowSettings(true);
      }
    };
    loadToken();
  }, []);

  // Add new state to track current PR URL
  // Modify the load cached suggestions effect to handle PR changes
  useEffect(() => {
    const loadCachedSuggestions = async () => {
      if (!token) return;

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.url?.includes("github.com") || !tab.url?.includes("/pull/")) {
        setSuggestions([]);
        setCurrentPrUrl(null);
        return;
      }

      // If we've changed PRs, clear the suggestions and trigger a fetch
      if (currentPrUrl && currentPrUrl !== tab.url) {
        setSuggestions([]);
        setCurrentPrUrl(tab.url);
        // Trigger fetch for new PR
        fetchSuggestions(false);
        return;
      }

      setCurrentPrUrl(tab.url);

      const url = new URL(tab.url);
      const [, owner, repo, , pullNumber] = url.pathname.split("/");
      const cacheKey = `${owner}/${repo}/pull/${pullNumber}`;

      const { cachedSuggestions = {} } = await chrome.storage.local.get(
        "cachedSuggestions"
      );
      const cached = cachedSuggestions[cacheKey];

      if (cached && cached.suggestions) {
        setSuggestions(cached.suggestions);
      } else {
        // If no cache exists, trigger a fetch
        fetchSuggestions(false);
      }
    };

    loadCachedSuggestions();
  }, [token, currentPrUrl]); // Add fetchSuggestions to dependencies if needed

  // Only fetch suggestions when we have a token
  useEffect(() => {
    if (token) {
      // Don't set loading here anymore
      // Just handle token initialization if needed
    }
  }, [token]);

  const handleTokenSave = async (newToken: string) => {
    try {
      const isValid = await validateGitHubToken(newToken);
      if (!isValid) {
        setError("Invalid GitHub token. Please check the token and try again.");
        return;
      }

      await chrome.storage.sync.set({ githubToken: newToken });
      setToken(newToken);
      setShowSettings(false);
      setError(null);
    } catch (err) {
      console.error("Error saving token:", err);
      setError("Failed to save token");
    }
  };

  const fetchSuggestions = async (forceRefresh = false) => {
    if (!token) {
      setShowSettings(true);
      return;
    }

    setLoading(true); // Set loading state at the start
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.url?.includes("github.com") || !tab.url?.includes("/pull/")) {
        setError("Please navigate to a GitHub pull request page");
        return;
      }

      const url = new URL(tab.url);
      const [, owner, repo, , pullNumber] = url.pathname.split("/");
      const cacheKey = `${owner}/${repo}/pull/${pullNumber}`;

      // Check cache if not forcing refresh
      if (!forceRefresh) {
        const { cachedSuggestions = {} } = await chrome.storage.local.get(
          "cachedSuggestions"
        );
        const cached = cachedSuggestions[cacheKey];

        if (cached && cached.timestamp) {
          const cacheAge = Date.now() - cached.timestamp;
          if (cacheAge < 5 * 60 * 1000) {
            setSuggestions(cached.suggestions);
            return;
          }
        }
      }

      try {
        const codeDiff = await fetchPullRequestDiff(
          owner,
          repo,
          parseInt(pullNumber),
          token
        );

        // Change this URL to point to your development server
        const response = await fetch("http://localhost:3000/api/suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ codeDiff }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch suggestions: ${response.statusText}`
          );
        }

        const data = await response.json();
        setSuggestions(data.suggestions);

        // Cache the new suggestions
        const { cachedSuggestions = {} } = await chrome.storage.local.get(
          "cachedSuggestions"
        );
        await chrome.storage.local.set({
          cachedSuggestions: {
            ...cachedSuggestions,
            [cacheKey]: {
              suggestions: data.suggestions,
              timestamp: Date.now(),
            },
          },
        });
      } catch (err: any) {
        if (err.message.includes("404")) {
          setError(
            "Pull request not found. Please check if you have access to this repository."
          );
          setShowSettings(true);
        } else if (err.message.includes("401") || err.message.includes("403")) {
          setError(
            "Invalid or expired GitHub token. Please update your token."
          );
          setShowSettings(true);
        } else {
          setError(`Failed to fetch pull request: ${err.message}`);
        }
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false); // Always reset loading state
    }
  };

  const handleError = (err: any) => {
    if (err.message.includes("401") || err.message.includes("403")) {
      setError("Invalid or expired GitHub token. Please update your token.");
      setToken(null);
      setShowSettings(true);
    } else {
      setError(err.message);
    }
  };

  if (showSettings) {
    return (
      <div style={{ width: "580px", minWidth: "580px" }}>
        <Settings
          onTokenSave={handleTokenSave}
          onCancel={() => setShowSettings(false)}
          initialError={error}
        />
      </div>
    );
  }

  return (
    <div style={{ width: "580px", minWidth: "580px" }}>
      <SuggestionBox
        suggestions={suggestions}
        loading={loading}
        error={error}
        onRefresh={() => fetchSuggestions(true)}
        onOpenSettings={() => setShowSettings(true)}
      />
    </div>
  );
};

export default ExtensionPage;
