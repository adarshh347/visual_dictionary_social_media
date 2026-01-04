import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <nav className={`navbar ${isLandingPage ? '' : 'navbar--dark'}`}>
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