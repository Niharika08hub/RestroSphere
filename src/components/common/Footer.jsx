import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>📚 ABES Lost & Found</h3>
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
            <p>📧 aakashasthana6@gmail.com</p>
            <p>📞 (+91) 8707017802</p>
            <p>📍 Student Services Building</p>
          </div>

          <div className="footer-section">
            <h4>Office Hours</h4>
            <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
            <p>Saturday: 10:00 AM - 4:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 ABES Lost & Found. All rights reserved.</p>
          <p>Built with ❤️ for our campus community #Akdon</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
