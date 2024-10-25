import React from "react";
import { createRoot } from "react-dom/client";
import SuggestionBox from "./components/SuggestionBox";

document.addEventListener("DOMContentLoaded", () => {
  const diffElements = document.querySelectorAll(".js-file-line");
  const addedLines = [];
  const modifiedLines = [];

  diffElements.forEach((line) => {
    if (line.classList.contains("blob-code-added")) {
      const lineContent = line.textContent || "";
      addedLines.push(lineContent);
    } else if (line.classList.contains("blob-code-modified")) {
      const lineContent = line.textContent || "";
      modifiedLines.push(lineContent);
    }
  });

  const combinedDiff = `
    Added Lines:
    ${addedLines.join("\n")}

    Modified Lines:
    ${modifiedLines.join("\n")}
  `;

  fetchSuggestionsFromServer(combinedDiff)
    .then((suggestions) => {
      const container = document.createElement("div");
      container.id = "github-pr-helper-suggestions";

      container.style.position = "fixed";
      container.style.right = "20px";
      container.style.top = "20px";
      container.style.width = "300px";
      container.style.background = "#f9f9f9";
      container.style.border = "1px solid #ccc";
      container.style.padding = "10px";
      container.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
      container.style.zIndex = "1000";
      container.style.borderRadius = "8px";
      container.style.maxHeight = "80vh";
      container.style.overflowY = "auto";

      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(<SuggestionBox suggestions={suggestions} />);
    })
    .catch((error) => {
      console.error("Error fetching suggestions:", error);
    });
});

async function fetchSuggestionsFromServer(codeDiff) {
  const apiUrl = "https://your-app.vercel.app/api/suggestions"; // Replace with your deployed API URL

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      codeDiff,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch suggestions");
  }

  const data = await response.json();
  return data.suggestions;
}
