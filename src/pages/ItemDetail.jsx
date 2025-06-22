import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItems, updateItem } from "../utils/localStorage";
import "./ItemDetail.css";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadItem = () => {
      const items = getItems();
      const foundItem = items.find((item) => item.id === id);

      if (foundItem) {
        setItem(foundItem);
      } else {
        navigate("/view-items");
      }
      setLoading(false);
    };

    loadItem();
  }, [id, navigate]);

  const handleMarkAsClaimed = () => {
    setShowModal(true);
  };

  const confirmMarkAsClaimed = () => {
    const items = getItems();
    const updatedItems = items.map((i) =>
      i.id === id
        ? { ...i, claimed: true, claimedDate: new Date().toISOString() }
        : i
    );

    updateItem(updatedItems);
    setItem({ ...item, claimed: true, claimedDate: new Date().toISOString() });
    setShowModal(false);

    setTimeout(() => {
      navigate("/view-items");
    }, 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="item-detail">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="item-detail">
        <div className="not-found">
          <h2>Item Not Found</h2>
          <p>The item you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate("/view-items")} className="back-btn">
            Back to Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="item-detail">
      <div className="item-detail-container">
        <button onClick={() => navigate("/view-items")} className="back-btn">
          ← Back to Items
        </button>

        <div className="item-detail-card">
          <div className="item-header">
            <div className="item-status">
              <span className={`status-badge ${item.type}`}>
                {item.type === "lost" ? "🔍 Lost" : "✨ Found"}
              </span>
              {item.claimed && (
                <span className="claimed-badge">✅ Claimed</span>
              )}
            </div>
            <h1 className="item-title">{item.title}</h1>
          </div>

          <div className="item-content">
            {item.image && (
              <div className="item-image-container">
                <img
                  src={item.image}
                  alt={item.title}
                  className="item-image"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="item-info">
              <div className="info-section">
                <h3>Description</h3>
                <p className="item-description">{item.description}</p>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">📅 Date</span>
                  <span className="info-value">{formatDate(item.date)}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">📍 Location</span>
                  <span className="info-value">{item.location}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">📞 Contact</span>
                  <span className="info-value">{item.contact}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">🏷️ Category</span>
                  <span className="info-value">{item.category}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">📝 Reported</span>
                  <span className="info-value">
                    {formatDate(item.reportedDate)}
                  </span>
                </div>

                {item.claimed && item.claimedDate && (
                  <div className="info-item">
                    <span className="info-label">✅ Claimed On</span>
                    <span className="info-value">
                      {formatDate(item.claimedDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!item.claimed && (
            <div className="item-actions">
              <button onClick={handleMarkAsClaimed} className="claim-btn">
                Mark as Claimed
              </button>
            </div>
          )}

          {item.claimed && (
            <div className="claimed-notice">
              <p>🎉 This item has been successfully claimed!</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Action</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to mark this item as claimed?</p>
              <p>
                <strong>"{item.title}"</strong>
              </p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowModal(false)}
                className="modal-btn cancel"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkAsClaimed}
                className="modal-btn confirm"
              >
                Yes, Mark as Claimed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;
