import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo">
        Framewise
      </NavLink>
      <div className="nav-links">
        <NavLink to="/gallery">Gallery</NavLink>
        <NavLink to="/epics">Epics</NavLink>
        <NavLink to="/feed">Highlights</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;