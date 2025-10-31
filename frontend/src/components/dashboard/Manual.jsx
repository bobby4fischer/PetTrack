import React from "react";
import "./Manual.css";

const Manual = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="manual-overlay" onClick={onClose}>
      <div className="manual-modal" onClick={(e) => e.stopPropagation()}>
        <div className="manual-header">
          <h3 className="manual-title">Manual</h3>
          <button className="manual-close" onClick={onClose} title="Close">✖</button>
        </div>
        <div className="manual-section">
          <div className="manual-content">
            <ul>
              <li>Feed, Give Milk, and Play from the left panel.</li>
              <li>Use the Focus Timer to track sessions.</li>
              <li>Play/Pause music and adjust volume in the timer area.</li>
              <li>Manage theme and account from ⚙️ Settings in the nav.</li>
              <li>Add and manage tasks in the right panel.</li>
              <li>Buy more supplies from 🏪 Store when running low.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manual;