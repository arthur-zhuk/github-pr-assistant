import React from "react";
import styles from "./SuggestionBox.module.css"; // We'll create this
import ReactMarkdown from "react-markdown";

interface SuggestionBoxProps {
  suggestions: string[];
  loading: boolean;
  error?: string;
  onRefresh?: () => void; // Add this prop
}

const SuggestionBox: React.FC<SuggestionBoxProps> = ({
  suggestions,
  loading,
  error,
  onRefresh,
}) => {
  if (loading) return <p className={styles.loading}>Loading suggestions...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>GitHub PR Helper</h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className={styles.refreshButton}
              disabled={loading}
            >
              Refresh
            </button>
          )}
        </div>
        <div className={styles.content}>
          {suggestions.map((suggestion, index) => (
            <ReactMarkdown
              key={index}
              className={styles.suggestion}
              components={{
                h3: ({ node, ...props }) => (
                  <h3 className={styles.sectionHeader} {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className={styles.sectionHeader} {...props} />
                ),
              }}
            >
              {suggestion}
            </ReactMarkdown>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionBox;
