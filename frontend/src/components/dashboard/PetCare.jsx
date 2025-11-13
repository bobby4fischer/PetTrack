import React from "react";
import "./PetCare.css";

const PetCare = ({ inventory, petData, feedPet }) => {
  return (
    <section className="panel card pet-care">
      <h2 className="panel-title">Pet Care</h2>

      <div className="inventory-grid">
        <div className="inventory-item">
          <div className="item-left">
            <span className="item-emoji">🥕</span>
            <div className="item-meta">
              <div className="item-count">x{inventory.food}</div>
              <div className="item-label">Food</div>
            </div>
          </div>
          <button
            className="feed-button"
            onClick={() => feedPet("food")}
            disabled={inventory.food === 0 || !petData.isAlive}
          >
            Feed
          </button>
        </div>

        <div className="inventory-item">
          <div className="item-left">
            <span className="item-emoji">🥛</span>
            <div className="item-meta">
              <div className="item-count">x{inventory.milk}</div>
              <div className="item-label">Milk</div>
            </div>
          </div>
          <button
            className="feed-button"
            onClick={() => feedPet("milk")}
            disabled={inventory.milk === 0 || !petData.isAlive}
          >
            Give Milk
          </button>
        </div>

        <div className="inventory-item">
          <div className="item-left">
            <span className="item-emoji">🧸</span>
            <div className="item-meta">
              <div className="item-count">x{inventory.toys}</div>
              <div className="item-label">Toys</div>
            </div>
          </div>
          <button
            className="feed-button"
            onClick={() => feedPet("toys")}
            disabled={inventory.toys === 0 || !petData.isAlive}
          >
            Play
          </button>
        </div>
      </div>

      <div className="pet-status">
        <h3 className="status-title">Pet Status</h3>

        <div className="status-row">
          <span className="status-label">Health</span>
          <div className="health-bar">
            <div
              className="health-fill"
              style={{ width: `${petData.life}%` }}
            />
          </div>
          <span className="status-value">{petData.life}%</span>
        </div>

        <div className="status-row">
          <span className="status-label">Mood</span>
          <div className="status-value">
            {petData.life > 80
              ? "😄"
              : petData.life > 60
              ? "😊"
              : petData.life > 40
              ? "😐"
              : petData.life > 20
              ? "😟"
              : "😢"}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PetCare;