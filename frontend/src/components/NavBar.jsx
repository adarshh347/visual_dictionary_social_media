import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css'; // <-- Corrected filename (lowercase 'b')

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo">
        {/* Your comment about NavLink is correct and a great learning point! */}
        Framewise
      </NavLink>
      <div className="nav-links">
        <NavLink to="/gallery">Gallery</NavLink>
        <NavLink to="/feed">Highlights</NavLink>
      </div>
    </nav> // <-- Corrected closing tag
  );
}

export default Navbar;