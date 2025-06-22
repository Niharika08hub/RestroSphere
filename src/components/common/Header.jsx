import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ToggleTheme from "./ToggleTheme";
import "./Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-icon">📚</span>
          <span className="logo-text">ABES Lost & Found</span>
          <div className="logo-underline"></div>
        </Link>

        <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
            <div className="nav-indicator"></div>
          </Link>
          <Link
            to="/report"
            className={`nav-link ${isActive("/report") ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-text">Report Item</span>
            <div className="nav-indicator"></div>
          </Link>
          <Link
            to="/view-items"
            className={`nav-link ${isActive("/view-items") ? "active" : ""}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">🔍</span>
            <span className="nav-text">View Items</span>
            <div className="nav-indicator"></div>
          </Link>
        </nav>

        <div className="header-actions">
          <ToggleTheme />
          <button
            className={`mobile-menu-btn ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className="hamburger">
              <span className="line line-1"></span>
              <span className="line line-2"></span>
              <span className="line line-3"></span>
            </span>
          </button>
        </div>
      </div>

      {isMenuOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}
    </header>
  );
};

export default Header;
