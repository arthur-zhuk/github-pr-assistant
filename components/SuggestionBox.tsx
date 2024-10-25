import React from "react";
import ReactMarkdown from "react-markdown";
import styles from "./SuggestionBox.module.css";

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
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.refreshButton} onClick={onRefresh}>
            Refresh
          </button>
          <button className={styles.refreshButton} onClick={onOpenSettings}>
            Settings
          </button>
        </div>
        <div className={styles.content}>
          {suggestions.map((suggestion, index) => (
            <div key={index} className={styles.suggestion}>
              <ReactMarkdown>{suggestion}</ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionBox;
