import React from "react";
import useTheme from "../../context/useTheme";
import "./ToggleTheme.css";

const ToggleTheme = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-wrapper">
      <button
        onClick={toggleTheme}
        className={`theme-toggle ${isDark ? "dark" : "light"}`}
        aria-label="Toggle theme"
      >
        <div className="toggle-track">
          <div className={`toggle-thumb ${isDark ? "active" : ""}`}>
            <span className="toggle-icon" aria-hidden="true">
              {isDark ? "\ud83c\udf19" : "\u2600\ufe0f"}
            </span>
          </div>
          <div className="toggle-background">
            <span className="toggle-bg-icon sun"></span>
            <span className="toggle-bg-icon moon"></span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ToggleTheme;
