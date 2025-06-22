import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <div className="container">
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">ABES Lost & Found</h1>
            <p className="hero-description">
              A platform to help students and staff reconnect with their lost
              belongings. Report lost items, browse found items, and help build
              a supportive campus community.
            </p>
            <div className="hero-actions">
              <Link to="/report" className="btn btn-primary btn-lg">
                Report an Item
              </Link>
              <Link to="/view-items" className="btn btn-secondary btn-lg">
                Browse Items
              </Link>
            </div>
          </div>
        </section>
        <section className="features">
          <h2 className="features-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">Report Items</h3>
              <p className="feature-description">
                Found something or lost an item? Submit a detailed report with
                description, location, and contact information.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">Search & Browse</h3>
              <p className="feature-description">
                Browse through reported items with filters by category, date,
                and location to find what you're looking for.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3 className="feature-title">Connect & Claim</h3>
              <p className="feature-description">
                Found your item? Contact the finder directly and mark items as
                claimed to keep the database updated.
              </p>
            </div>
          </div>
        </section>
        <section className="stats">
          <h2 className="stats-title">Making a Difference</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Items Reported</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">85%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1200+</div>
              <div className="stat-label">Happy Students</div>
            </div>
          </div>
        </section>
        <section className="cta">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-description">
              Join our campus community in creating a more helpful and connected
              environment.
            </p>
            <div className="cta-actions">
              <Link to="/report" className="btn btn-primary">
                Report Lost/Found Item
              </Link>
              <Link to="/view-items" className="btn btn-secondary">
                View All Items
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
