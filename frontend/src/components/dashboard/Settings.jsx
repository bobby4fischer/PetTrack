import React, { useState } from "react";
import "./Settings.css";

const Settings = ({ isOpen, onClose, theme, toggleTheme, user, onLogout }) => {
  if (!isOpen) return null;
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");

  const sendSummaryEmail = async () => {
    // Client-only: save a summary draft based on completed tasks in localStorage
    try {
      setSendingEmail(true);
      setEmailStatus("");
      const email = user?.email;
      if (!email) {
        setEmailStatus('No user email set');
        return;
      }
      const keyCompleted = `completedTasks:${email}`;
      const keyLast = `emailLast:${email}`;
      const keyDrafts = `emailDrafts:${email}`;

      let history = [];
      try {
        const raw = localStorage.getItem(keyCompleted);
        history = raw ? JSON.parse(raw) : [];
      } catch {}

      const lastSent = Number(localStorage.getItem(keyLast) || 0);
      const recent = history.filter((h) => {
        const t = new Date(h.completedAt).getTime();
        return !Number.isNaN(t) && t > lastSent;
      });

      const summary = {
        at: new Date().toISOString(),
        count: recent.length,
        tasks: recent,
      };

      try {
        const prev = localStorage.getItem(keyDrafts);
        const drafts = prev ? JSON.parse(prev) : [];
        drafts.push(summary);
        localStorage.setItem(keyDrafts, JSON.stringify(drafts));
      } catch {}

      localStorage.setItem(keyLast, String(Date.now()));
      setEmailStatus('Summary saved locally');
    } catch (err) {
      console.error('Save summary error:', err);
      setEmailStatus('Unexpected error');
    } finally {
      setSendingEmail(false);
    }
  };
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
          <div className="settings-row">
            <span className="settings-label">Email Summary (Local)</span>
            <button className="settings-toggle" onClick={sendSummaryEmail} disabled={sendingEmail}>
              {sendingEmail ? 'Saving…' : 'Save local summary'}
            </button>
          </div>
          {emailStatus && (
            <div className="settings-row">
              <span className="settings-label">Status</span>
              <span className="settings-value">{emailStatus}</span>
            </div>
          )}
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