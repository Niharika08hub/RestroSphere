import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3> IGDTUW Lost & Found</h3>
            <p>Helping students and staff reconnect with their belongings.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/report">Report Item</a>
              </li>
              <li>
                <a href="/view-items">View Items</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>📧 deansw@igdtuw.ac.in</p>
            <p>📞 011-23900221</p>
            <p>📍Examination Block</p>
          </div>

          <div className="footer-section">
            <h4>Office Hours</h4>
<p>10:00 AM - 5:00 PM</p>
            <p>Saturday - Sunday : Closed</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 IGDTUW Lost & Found. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
