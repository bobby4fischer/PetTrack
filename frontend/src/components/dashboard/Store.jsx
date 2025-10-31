import React from "react";
import "./Store.css";

const Store = ({ isOpen, onClose, ITEM_COSTS, buyItem, gems }) => {
  if (!isOpen) return null;
  return (
    <div className="store-overlay" onClick={onClose}>
      <div className="store-modal" onClick={(e) => e.stopPropagation()}>
        <div className="store-header">
          <h3 className="store-title">Pet Store</h3>
          <button className="store-close" onClick={onClose} title="Close">✖</button>
        </div>
        <div className="store-section">
          <div className="store-grid">
            <div className="store-card">
              <div className="store-item-left">
                <span className="store-emoji">🥕</span>
                <div className="store-meta">
                  <div className="store-name">Food</div>
                  <div className="store-desc">Boost pet health (+20)</div>
                  <div className="store-price">Cost: {ITEM_COSTS.food}💎</div>
                </div>
              </div>
              <button className="store-buy-btn" onClick={() => buyItem('food')} disabled={gems < ITEM_COSTS.food}>Buy +1</button>
            </div>

            <div className="store-card">
              <div className="store-item-left">
                <span className="store-emoji">🥛</span>
                <div className="store-meta">
                  <div className="store-name">Milk</div>
                  <div className="store-desc">Refresh & hydrate (+15)</div>
                  <div className="store-price">Cost: {ITEM_COSTS.milk}💎</div>
                </div>
              </div>
              <button className="store-buy-btn" onClick={() => buyItem('milk')} disabled={gems < ITEM_COSTS.milk}>Buy +1</button>
            </div>

            <div className="store-card">
              <div className="store-item-left">
                <span className="store-emoji">🧸</span>
                <div className="store-meta">
                  <div className="store-name">Toy</div>
                  <div className="store-desc">Cheer up & play (+10)</div>
                  <div className="store-price">Cost: {ITEM_COSTS.toys}💎</div>
                </div>
              </div>
              <button className="store-buy-btn" onClick={() => buyItem('toys')} disabled={gems < ITEM_COSTS.toys}>Buy +1</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;