import React from "react";
import { createRoot } from "react-dom/client";
import ExtensionPage from "./page"; // Ensure the path is correct
import "./global.css"; // Add this import

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(<ExtensionPage />);
} else {
  console.error("Root container not found");
}
