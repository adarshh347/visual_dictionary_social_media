import React from 'react';
import { Link } from 'react-router-dom';
import legPalmImage from '../assets/leg-palm.jpg';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <section className="landing-hero">
        {/* Left - Content */}
        <div className="landing-content">
          <span className="landing-tagline">Visual Storytelling Platform</span>

          <h1 className="landing-title">
            <span className="landing-title-hindi">दृष्टिकोण</span>
            Drishtikone
          </h1>

          <p className="landing-description">
            An interactive canvas where images meet narrative.
            Create semantic stories, curate visual epics, and
            explore the art of meaningful composition.
          </p>

          <Link to="/gallery" className="landing-cta">
            Explore Gallery
            <span className="landing-cta-arrow">→</span>
          </Link>

          <div className="landing-features">
            <div className="landing-feature">
              <div className="landing-feature-number">01</div>
              <div className="landing-feature-text">
                Curate collections with semantic tagging and AI-powered organization
              </div>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-number">02</div>
              <div className="landing-feature-text">
                Create visual epics that weave images into compelling narratives
              </div>
            </div>
          </div>
        </div>

        {/* Right - Image */}
        <div className="landing-image-container">
          <img
            src={legPalmImage}
            alt="Visual storytelling"
            className="landing-image"
          />
          <span className="landing-decorative-text">Art & Narrative</span>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;