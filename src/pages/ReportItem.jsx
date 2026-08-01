import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { getItems, updateItem, addItem } from "../utils/firebaseStorage";
import "./ReportItem.css";

const ReportItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

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

 



  useEffect(() => {
  if (!isEditMode) return;

  const loadItem = async () => {
    try {
      const items = await getItems();

      console.log("Items:", items);
      console.log("Array?", Array.isArray(items));

      const existingItem = items.find((item) => item.id === id);

      if (!existingItem) return;

      setFormData({
        title: existingItem.title || "",
        description: existingItem.description || "",
        category: existingItem.category || "",
        type: existingItem.type || "lost",
        location: existingItem.location || "",
        date: existingItem.date || "",
        contactName: existingItem.contactName || "",
        contactEmail: existingItem.contactEmail || "",
        contactPhone: existingItem.contactPhone || "",
        image: existingItem.image || null,
      });
    } catch (error) {
      console.error("Error loading item:", error);
    }
  };

  loadItem();
}, [id, isEditMode]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        image: event.target.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const resetForm = () => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
if (!auth.currentUser) {
  alert("Please login with Google to report an item.");
  setIsSubmitting(false);
  return;
}
    try {
      if (isEditMode) {
       await updateItem(id, {
  ...formData,
});
      } else {
   await addItem({
  ...formData,
  status: "unclaimed",

  ownerId: auth.currentUser.uid,
  ownerName: auth.currentUser.displayName,
  ownerEmail: auth.currentUser.email,
});

resetForm();
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowModal(true);
    } catch (error) {
      console.error("Error submitting item:", error);
      alert("Something went wrong. Please try again.");
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
          <h1 className="report-title">
            {isEditMode ? "Edit Item" : "Report Lost or Found Item"}
          </h1>

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
                  />
                  <span className="radio-text">Found Item</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Item Title *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                className="form-input"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Blue iPhone 13"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category *
              </label>

              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleInputChange}
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
              <label htmlFor="description" className="form-label">
                Description *
              </label>

              <textarea
                id="description"
                name="description"
                rows="4"
                className="form-textarea"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide details like color, brand, size, etc."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location" className="form-label">
                {formData.type === "lost"
                  ? "Last Seen Location"
                  : "Found Location"}{" "}
                *
              </label>

              <input
                id="location"
                name="location"
                type="text"
                className="form-input"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Library, Cafeteria..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date" className="form-label">
                {formData.type === "lost" ? "Date Lost" : "Date Found"} *
              </label>

              <input
                id="date"
                name="date"
                type="date"
                className="form-input"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="contact-section">
              <h3 className="section-title">Contact Information</h3>

              <div className="form-group">
                <label htmlFor="contactName" className="form-label">
                  Your Name *
                </label>

                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  className="form-input"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactEmail" className="form-label">
                  Email Address *
                </label>

                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  className="form-input"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPhone" className="form-label">
                  Phone (Optional)
                </label>

                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  className="form-input"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image" className="form-label">
                Upload Image (Optional)
              </label>

              <input
                id="image"
                name="image"
                type="file"
                className="form-input file-input"
                accept="image/*"
                onChange={handleImageChange}
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
                    {isEditMode ? "Updating..." : "Submitting..."}
                  </>
                ) : isEditMode ? (
                  "Update Item"
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

              <h2 className="modal-title">
                {isEditMode
                  ? "Item Updated Successfully!"
                  : "Item Reported Successfully!"}
              </h2>

              <p className="modal-description">
                Your item has been saved successfully.
              </p>

              <div className="modal-actions">
                <button
                  onClick={closeModal}
                  className="btn btn-primary"
                >
                  View All Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ReportItem;