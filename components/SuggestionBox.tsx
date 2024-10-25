import React from "react";
import ReactMarkdown from "react-markdown";

const styles = {
  wrapper: {
    width: "580px",
    minWidth: "580px",
    padding: "16px",
    boxSizing: "border-box" as const,
  },
  container: {
    width: "100%",
    background: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #d0d7de",
    padding: "20px",
    maxHeight: "600px",
    overflowY: "auto" as const,
    boxSizing: "border-box" as const,
    margin: "0", // Added to ensure no margin interference
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: "20px",
    position: "sticky" as const,
    top: "0",
    background: "#ffffff",
    zIndex: 1,
  },
  refreshButton: {
    padding: "6px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#24292f",
    backgroundColor: "#f6f8fa",
    border: "1px solid rgba(27, 31, 36, 0.15)",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  },
  fileHeader: {
    width: "100%", // Added to ensure full width
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#24292f",
    padding: "12px 16px",
    background: "#f6f8fa",
    border: "1px solid #d0d7de",
    borderRadius: "6px",
    margin: "0 0 20px 0",
    wordBreak: "break-word" as const,
    boxSizing: "border-box" as const, // Added to include padding in width
  },
  sectionHeader: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#24292f",
    marginTop: "24px",
    marginBottom: "16px",
    paddingBottom: "8px",
    borderBottom: "1px solid #d8dee4",
  },
  content: {
    width: "100%", // Added to ensure full width
    "& pre": {
      width: "100%", // Added to ensure full width
      background: "#f6f8fa",
      border: "1px solid #d0d7de",
      borderRadius: "6px",
      padding: "16px",
      margin: "16px 0",
      overflowX: "auto" as const,
      boxSizing: "border-box" as const, // Added to include padding in width
    },
    "& code": {
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
      fontSize: "13px",
      lineHeight: "1.45",
      color: "#24292f",
    },
    "& ul, & ol": {
      paddingLeft: "24px",
      margin: "12px 0",
    },
    "& li": {
      margin: "8px 0",
      lineHeight: "1.6",
      color: "#24292f",
    },
    "& p": {
      margin: "12px 0",
      lineHeight: "1.6",
      color: "#24292f",
    },
  },
};

interface SuggestionBoxProps {
  suggestions: string[];
  loading: boolean;
  error?: string;
  onRefresh?: () => void; // Add this prop
  onOpenSettings?: () => void; // Add this prop
}

const SuggestionBox: React.FC<SuggestionBoxProps> = ({
  suggestions,
  loading,
  error,
  onRefresh,
  onOpenSettings,
}) => {
  if (loading) return <p>Loading suggestions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={{ display: "flex", gap: "8px" }}>
            {onRefresh && (
              <button onClick={onRefresh} style={styles.refreshButton}>
                Refresh
              </button>
            )}
            <button
              onClick={onOpenSettings}
              style={{
                ...styles.refreshButton,
                backgroundColor: "#ffffff",
              }}
            >
              Settings
            </button>
          </div>
        </div>
        <div style={styles.content}>
          {suggestions.map((suggestion, index) => (
            <div key={index}>
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => (
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#24292f",
                        padding: "8px 12px",
                        background: "#f6f8fa",
                        border: "1px solid #d0d7de",
                        borderRadius: "6px",
                        margin: "16px 0 12px 0",
                      }}
                      {...props}
                    />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: "600",
                        color: "#57606a",
                        margin: "16px 0 8px 0",
                        paddingBottom: "4px",
                        borderBottom: "1px solid #d8dee4",
                      }}
                      {...props}
                    />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre
                      style={{
                        background: "#f6f8fa",
                        border: "1px solid #d0d7de",
                        borderRadius: "6px",
                        padding: "16px",
                        margin: "16px 0",
                        overflowX: "auto",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                      {...props}
                    />
                  ),
                  code: ({ node, inline, ...props }) => (
                    <code
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                        fontSize: inline ? "85%" : "13px",
                        lineHeight: "1.45",
                        color: "#24292f",
                        background: inline ? "#f6f8fa" : "transparent",
                        padding: inline ? "0.2em 0.4em" : "0",
                        borderRadius: inline ? "3px" : "0",
                        border: inline ? "1px solid #d0d7de" : "none",
                      }}
                      {...props}
                    />
                  ),
                }}
              >
                {suggestion}
              </ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionBox;
