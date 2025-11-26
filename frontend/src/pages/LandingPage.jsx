import React from 'react';
import {Link} from 'react-router-dom';

function LandingPage(){
    return(
        <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
      <h1>दृष्टिकोण (Drishtikone)</h1>
      <p style={{ fontSize: '1.2rem', color: '#ccc' }}>An interactive canvas for semantic storytelling.</p>
      <Link to="/gallery">
        <button style={{ marginTop: '2rem', fontSize: '1.1rem' }}>Explore the Gallery</button>
      </Link>
    </div>
        );
    }

export default LandingPage;