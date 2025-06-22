import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportItem.css";

const ReportItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "lost",
    location: "",
    date: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    image: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categories = [
    "Electronics",
    "Clothing",
    "Books & Stationery",
    "Jewelry & Accessories",
    "Sports Equipment",
    "Bags & Wallets",
    "Keys",
    "Documents",
    "Other",
  ];
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          image: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const existingItems = JSON.parse(
        localStorage.getItem("lostFoundItems") || "[]"
      );
      const newItem = {
        id: Date.now().toString(),
        ...formData,
        dateReported: new Date().toISOString(),
        status: "unclaimed",
      };
      const updatedItems = [...existingItems, newItem];
      localStorage.setItem("lostFoundItems", JSON.stringify(updatedItems));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowModal(true);
      setFormData({
        title: "",
        description: "",
        category: "",
        type: "lost",
        location: "",
        date: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        image: null,
      });
    } catch (error) {
      console.error("Error submitting item:", error);
      alert("Error submitting item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const closeModal = () => {
    setShowModal(false);
    navigate("/view-items");
  };

  return (
    <div className="report-item">
      <div className="container">
        <div className="report-header">
          <h1 className="report-title">Report Lost or Found Item</h1>
          <p className="report-description">
            Help your fellow students by reporting items you've lost or found on
            campus.
          </p>
        </div>

        <div className="report-form-container">
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label className="form-label">Item Type *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="type"
                    value="lost"
                    checked={formData.type === "lost"}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="radio-text">Lost Item</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="type"
                    value="found"
                    checked={formData.type === "found"}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="radio-text">Found Item</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Item Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., Blue iPhone 13, Red backpack, etc."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Provide details like color, brand, size, etc."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">
                {formData.type === "lost"
                  ? "Last Seen Location"
                  : "Found Location"}{" "}
                *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., Library, Cafeteria, etc."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="date">
                {formData.type === "lost" ? "Date Lost" : "Date Found"} *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="contact-section">
              <h3 className="section-title">Contact Information</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="contactName">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contactEmail">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contactPhone">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="image">
                Upload Image (Optional)
              </label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                className="form-input file-input"
                accept="image/*"
              />
              {formData.image && (
                <div className="image-preview">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="preview-image"
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading"></span>
                    Submitting...
                  </>
                ) : (
                  `Report ${formData.type === "lost" ? "Lost" : "Found"} Item`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="success-icon">✅</div>
              <h2 className="modal-title">Item Reported Successfully!</h2>
              <p className="modal-description">
                Your {formData.type} item has been added to our database. Other
                students can now see it and contact you if they have
                information.
              </p>
              <div className="modal-actions">
                <button onClick={closeModal} className="btn btn-primary">
                  View All Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportItem;
