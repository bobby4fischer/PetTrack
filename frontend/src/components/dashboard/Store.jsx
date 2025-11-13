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
        <div className="store-topbar">
          <div className="store-gems-badge" title="Your gems">
            💎 <span className="store-gems-count">{gems}</span>
          </div>
        </div>
        <div className="store-section">
          <div className="store-grid">
            <div className="store-card">
              <div className="store-item-left">
                <span className="store-emoji">🥕</span>
                <div className="store-meta">
                  <div className="store-titleline">
                    <span className="store-name">Food</span>
                    <span className="store-price">{ITEM_COSTS.food}💎</span>
                  </div>
                  <div className="store-effect">Health +10</div>
                </div>
              </div>
              <button
                className="store-buy-btn"
                onClick={() => buyItem('food')}
                disabled={gems < ITEM_COSTS.food}
                title={gems < ITEM_COSTS.food ? 'Insufficient gems' : 'Buy Food'}
              >Buy +1</button>
            </div>

            <div className="store-card">
              <div className="store-item-left">
                <span className="store-emoji">🥛</span>
                <div className="store-meta">
                  <div className="store-titleline">
                    <span className="store-name">Milk</span>
                    <span className="store-price">{ITEM_COSTS.milk}💎</span>
                  </div>
                  <div className="store-effect">Health +5</div>
                </div>
              </div>
              <button
                className="store-buy-btn"
                onClick={() => buyItem('milk')}
                disabled={gems < ITEM_COSTS.milk}
                title={gems < ITEM_COSTS.milk ? 'Insufficient gems' : 'Buy Milk'}
              >Buy +1</button>
            </div>

            <div className="store-card">
              <div className="store-item-left">
                <span className="store-emoji">🧸</span>
                <div className="store-meta">
                  <div className="store-titleline">
                    <span className="store-name">Toy</span>
                    <span className="store-price">{ITEM_COSTS.toys}💎</span>
                  </div>
                  <div className="store-effect">Health +15</div>
                </div>
              </div>
              <button
                className="store-buy-btn"
                onClick={() => buyItem('toys')}
                disabled={gems < ITEM_COSTS.toys}
                title={gems < ITEM_COSTS.toys ? 'Insufficient gems' : 'Buy Toy'}
              >Buy +1</button>
            </div>
          </div>
          <div className="store-footer">
            <div className="store-tip">Tip: Toys grant the biggest mood boost. Stock up when you have spare gems!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;