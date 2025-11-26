import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

function Navbar(){
    return(
        <nav className="navbar">
            <NavLink to="/" className="nav-logo">
{/*              Navigation: It allows users to switch between different views or pages of the single-page
    application (SPA) without triggering a full page reload, which is the core function of NavLink.*/}
                Framewise
                </NavLink>
                <div className="nav-links">
                    <NavLink to="/gallery">Gallery</NavLink>
                    <NavLink to="/feed">Highlights</NavLink> {/* <-- Add this link */}
                    <NavLink to="/feed">Feed</NavLink>
                    </div>
            <nav/>

        );
    }

export default Navbar;