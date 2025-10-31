import React from "react";
import "./Settings.css";

const Settings = ({ isOpen, onClose, theme, toggleTheme, user, onLogout }) => {
  if (!isOpen) return null;
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3 className="settings-title">Settings</h3>
          <button className="settings-close" onClick={onClose} title="Close">✖</button>
        </div>
        <div className="settings-section">
          <div className="settings-row">
            <span className="settings-label">Theme</span>
            <button className="settings-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? '🌙 Night' : '☀️ Day'}
            </button>
          </div>
          <div className="settings-row">
            <span className="settings-label">User ID</span>
            <span className="settings-value">{user?.email || 'Not set'}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Name</span>
            <span className="settings-value">
              {(() => {
                if (user?.email) {
                  const local = user.email.split('@')[0];
                  return local.charAt(0).toUpperCase() + local.slice(1);
                }
                return 'User';
              })()}
            </span>
          </div>
        </div>
        <div className="settings-footer">
          <button className="logout-button" onClick={() => { onClose(); onLogout(); }}>
            👋 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;