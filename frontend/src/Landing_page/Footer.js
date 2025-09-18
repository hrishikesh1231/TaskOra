import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-column">
          <h3>About TaskOra</h3>
          <p>
            TaskOra helps you find gigs, services, and trustworthy local help
            with ease and security.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/gigs">Gigs</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Social Links */}
        <div className="footer-column">
          <h3>Follow Us</h3>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">LinkedIn</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="footer-bottom">
        <p>© 2025 TaskOra. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
