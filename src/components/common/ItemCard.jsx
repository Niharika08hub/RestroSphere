import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./ItemCard.css";
const ItemCard = ({ item, onClaim, onDelete }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
  });

  return () => unsubscribe();
}, []);
const isOwner =
  auth.currentUser && item.ownerId === auth.currentUser.uid;
const handleEdit = (e) => {
  e.preventDefault();
  e.stopPropagation();

  console.log("Edit clicked", item.id);

  navigate(`/edit/${item.id}`);
};

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

const handleDelete = (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!window.confirm("Delete this item?")) return;

  if (onDelete) {
    onDelete(item.id);
  }
};


return (
  <div className={`item-card ${item.claimed ? "claimed" : ""}`}>

    {/* Clickable Card */}
    <Link to={`/item/${item.id}`} className="card-link">

      <div className="card-header">
        <div className="item-type">
          <span className={`type-badge ${item.type}`}>
            {item.type === "lost" ? "🔍 Lost" : "🔎 Found"}
          </span>

          {item.claimed && (
            <span className="claimed-badge">
              ✅ Claimed
            </span>
          )}
        </div>

        <div className="item-category">
          {item.category}
        </div>
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

        <h3 className="item-title">
          {item.title}
        </h3>

        <p className="item-description">
          {item.description}
        </p>

        <div className="item-details">

         <div className="detail-item">
  <span className="detail-label">
     Date :
  </span>

  <span className="detail-value">
    {formatDate(item.dateReported)}
  </span>
</div>

          <div className="detail-item">
            <span className="detail-label">
               Location : 
            </span>

            <span className="detail-value">
              {item.location}
            </span>
          </div>

          {(item.contactName || item.contactEmail) && (
            <div className="detail-item">
              <span className="detail-label">
                 Contact :
              </span>

              <span className="detail-value">
                {item.contactName}
              </span>
            </div>
          )}

        </div>

      </div>

    </Link>

    {/* Buttons OUTSIDE Link */}

    <div className="card-actions">

     {isOwner && !item.claimed && (
  <>
    <button
      className="edit-btn"
      onClick={handleEdit}
    >
      Edit
    </button>

    <button
      className="claim-btn"
      onClick={handleClaim}
    >
      Mark as Claimed
    </button>
  </>
)}

{isOwner && (
  <button
    className="delete-btn"
    onClick={handleDelete}
  >
    Delete
  </button>
)}

    </div>

    {item.claimed && (
      <div className="claimed-notice">
         This item has been claimed.
      </div>
    )}

  </div>
);  
};
export default ItemCard;
