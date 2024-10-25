"use client";

import React, { useEffect, useState } from "react";
import SuggestionBox from "../../components/SuggestionBox";
import { fetchPullRequestDiff } from "../../githubService";
import Settings from "./settings";

const ExtensionPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [needsToken, setNeedsToken] = useState<boolean>(false);

  const fetchSuggestions = async () => {
    try {
      const { githubToken } = await chrome.storage.sync.get("githubToken");

      if (!githubToken) {
        setNeedsToken(true);
        setLoading(false);
        return;
      }

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const url = new URL(tab.url!);
      const [, owner, repo, , pullNumber] = url.pathname.split("/");

      // Check cache first
      const { cachedSuggestions } = await chrome.storage.local.get(
        "cachedSuggestions"
      );
      const cacheKey = `${owner}/${repo}/pull/${pullNumber}`;
      const cached = cachedSuggestions?.[cacheKey];

      if (cached) {
        setSuggestions(cached.suggestions);
        setLoading(false);
        return;
      }

      const codeDiff = await fetchPullRequestDiff(
        owner,
        repo,
        parseInt(pullNumber),
        githubToken
      );

      const response = await fetch("http://localhost:3000/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codeDiff }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      setSuggestions(data.suggestions);

      // Cache the new suggestions
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
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  if (needsToken) {
    return (
      <Settings
        onTokenSave={() => {
          setNeedsToken(false);
          setLoading(true);
          fetchSuggestions();
        }}
      />
    );
  }

  return (
    <div style={{ width: "380px", height: "100%" }}>
      <SuggestionBox
        suggestions={suggestions}
        loading={loading}
        error={error || undefined}
      />
    </div>
  );
};

export default ExtensionPage;
