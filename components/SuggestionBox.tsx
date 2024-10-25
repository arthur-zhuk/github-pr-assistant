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
    maxHeight: "600px",
    overflowY: "auto" as const,
    boxSizing: "border-box" as const,
    margin: "0",
    position: "relative" as const,
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "8px",
    padding: "16px",
    background: "#ffffff",
    borderBottom: "1px solid #d0d7de",
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
  content: {
    padding: "16px",
    "& pre": {
      width: "100%",
      background: "#f6f8fa",
      border: "1px solid #d0d7de",
      borderRadius: "6px",
      padding: "16px",
      margin: "16px 0",
      overflowX: "auto" as const,
      boxSizing: "border-box" as const,
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
  onRefresh?: () => void;
  onOpenSettings?: () => void;
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
        {/* Fixed header */}
        <div style={styles.header}>
          <button style={styles.refreshButton} onClick={onRefresh}>
            Refresh
          </button>
          <button style={styles.refreshButton} onClick={onOpenSettings}>
            Settings
          </button>
        </div>

        {/* Scrollable content */}
        <div style={styles.content}>
          {suggestions.map((suggestion, index) => (
            <ReactMarkdown key={index}>{suggestion}</ReactMarkdown>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionBox;
