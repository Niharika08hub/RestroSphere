import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ItemCard from "../components/common/ItemCard";
import "./ViewItems.css";

const ViewItems = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    category: "all",
    status: "unclaimed",
  });

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
    const loadItems = () => {
      try {
        const storedItems = localStorage.getItem("lostFoundItems");
        const parsedItems = storedItems ? JSON.parse(storedItems) : [];
        setItems(parsedItems);
        setFilteredItems(parsedItems);
      } catch (error) {
        console.error("Error loading items:", error);
        setItems([]);
        setFilteredItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  useEffect(() => {
    let filtered = [...items];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.location.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((item) => item.type === filters.type);
    }

    if (filters.category !== "all") {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    setFilteredItems(filtered);
  }, [items, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleMarkAsClaimed = (itemId, verify = false) => {
    if (verify) {
      const updatedItems = items.filter((item) => item.id !== itemId);
      setItems(updatedItems);
      localStorage.setItem("lostFoundItems", JSON.stringify(updatedItems));
    } else {
      const updatedItems = items.map((item) =>
        item.id === itemId
          ? { ...item, status: "claimed", claimed: true }
          : item
      );
      setItems(updatedItems);
      localStorage.setItem("lostFoundItems", JSON.stringify(updatedItems));
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "all",
      category: "all",
      status: "unclaimed",
    });
  };

  if (loading) {
    return (
      <div className="view-items">
        <div className="container">
          <div className="loading-container">
            <div className="loading"></div>
            <p>Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-items">
      <div className="container">
        <div className="items-header">
          <h1 className="items-title">Lost & Found Items</h1>
          <p className="items-description">
            Browse through reported lost and found items. Found what you're
            looking for? Contact the person who reported it!
          </p>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <label className="filter-label" htmlFor="search-input">
              Search
            </label>
            <input
              id="search-input"
              name="search"
              type="text"
              placeholder="Search by title, description, or location..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="filter-input search-input"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="type-select">
              Type
            </label>
            <select
              id="type-select"
              name="type"
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="filter-select"
            >
              <option value="all">All Items</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="category-select">
              Category
            </label>
            <select
              id="category-select"
              name="category"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="status-select">
              Status
            </label>
            <select
              id="status-select"
              name="status"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="unclaimed">Available</option>
              <option value="claimed">Claimed</option>
            </select>
          </div>

          <div className="filter-group">
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>

        <div className="items-stats">
          <div className="stat">
            <span className="stat-number">{filteredItems.length}</span>
            <span className="stat-label">Items Found</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {filteredItems.filter((item) => item.type === "lost").length}
            </span>
            <span className="stat-label">Lost Items</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {filteredItems.filter((item) => item.type === "found").length}
            </span>
            <span className="stat-label">Found Items</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {
                filteredItems.filter((item) => item.status === "unclaimed")
                  .length
              }
            </span>
            <span className="stat-label">Available</span>
          </div>
        </div>

        <div className="items-content">
          {filteredItems.length === 0 ? (
            <div className="row-no-items">
              <div className="no-items">
                <div className="no-items-icon">🔍</div>
                <h3 className="no-items-title">No Items Found</h3>
                <p className="no-items-description">
                  {items.length === 0
                    ? "No items have been reported yet. Be the first to report a lost or found item!"
                    : "No items match your current filters. Try adjusting your search criteria."}
                </p>
                <div className="no-items-actions">
                  {items.length === 0 ? (
                    <Link to="/report" className="btn btn-primary">
                      Report an Item
                    </Link>
                  ) : (
                    <button
                      onClick={clearFilters}
                      className="btn btn-secondary"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="items-grid">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClaim={handleMarkAsClaimed}
                />
              ))}
            </div>
          )}
        </div>

        {filteredItems.length > 0 && (
          <div className="items-cta">
            <h3 className="cta-title">Don't see what you're looking for?</h3>
            <p className="cta-description">
              Report your lost item or help others by reporting something you
              found.
            </p>
            <Link to="/report" className="btn btn-primary">
              Report an Item
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewItems;
