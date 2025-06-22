import React from "react";
import { Link } from "react-router-dom";
import "./ItemCard.css";

const ItemCard = ({ item, onClaim }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleClaim = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClaim) {
      onClaim(item.id);
    }
  };

  return (
    <div className={`item-card ${item.claimed ? "claimed" : ""}`}>
      <Link to={`/item/${item.id}`} className="card-link">
        <div className="card-header">
          <div className="item-type">
            <span className={`type-badge ${item.type}`}>
              {item.type === "lost" ? "🔍 Lost" : "🔎 Found"}
            </span>
            {item.claimed && <span className="claimed-badge">✅ Claimed</span>}
          </div>
          <div className="item-category">{item.category}</div>
        </div>

        {item.image && (
          <div className="card-image">
            <img
              src={item.image}
              alt={item.title}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        <div className="card-content">
          <h3 className="item-title">{item.title}</h3>
          <p className="item-description">{item.description}</p>

          <div className="item-details">
            <div className="detail-item">
              <span className="detail-label">📅 Date:</span>
              <span className="detail-value">
                {formatDate(item.dateReported)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">📍 Location:</span>
              <span className="detail-value">{item.location}</span>
            </div>
            {item.contactInfo && (
              <div className="detail-item">
                <span className="detail-label">📞 Contact:</span>
                <span className="detail-value">{item.contactInfo}</span>
              </div>
            )}
          </div>
        </div>

        {!item.claimed && onClaim && (
          <div className="card-actions">
            <button className="claim-btn" onClick={handleClaim}>
              Mark as Claimed
            </button>
          </div>
        )}

        {item.claimed && onClaim && (
          <div className="card-actions">
            <button
              className="verify-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClaim(item.id, true);
              }}
            >
              Verify and Remove
            </button>
          </div>
        )}
      </Link>
    </div>
  );
};

export default ItemCard;
