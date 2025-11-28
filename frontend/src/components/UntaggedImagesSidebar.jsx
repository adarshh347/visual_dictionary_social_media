import { useState, useEffect } from 'react';
import axios from 'axios';

import { API_URL } from '../config/api';

function UntaggedImagesSidebar({ isVisible, onClose, onImageSelect, selectedTag, story }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const fetchRandomUntaggedImages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/posts/untagged/random?limit=5`);
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching untagged images:", error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchRandomUntaggedImages();
    }
  }, [isVisible]);

  const handleImageClick = async (image) => {
    if (!selectedTag || !story) return;
    
    try {
      // Add both the tag and the story to the selected image
      await axios.patch(`${API_URL}/api/v1/posts/${image.id}/add-tag-and-story`, {
        tag: selectedTag,
        story: story
      });
      
      // Call the callback to shift story to this image
      if (onImageSelect) {
        onImageSelect(image);
      }
      
      // Refresh the images list
      fetchRandomUntaggedImages();
    } catch (error) {
      console.error("Error adding tag and story to image:", error);
      alert("Failed to associate story with image. Please try again.");
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      right: isMinimized ? '-300px' : '0',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '320px',
      maxHeight: '80vh',
      backgroundColor: '#2a2a2a',
      border: '1px solid #444',
      borderRadius: '8px 0 0 8px',
      boxShadow: '-2px 0 10px rgba(0,0,0,0.3)',
      zIndex: 1000,
      transition: 'right 0.3s ease',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with minimize/close buttons */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#333',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>
          Untagged Images
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'transparent',
              border: '1px solid #555',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {isMinimized ? '▶' : '◀'}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #555',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Content */}
          <div style={{
            padding: '16px',
            overflowY: 'auto',
            flex: 1
          }}>
            {loading ? (
              <p style={{ color: '#aaa', textAlign: 'center' }}>Loading images...</p>
            ) : images.length === 0 ? (
              <p style={{ color: '#aaa', textAlign: 'center' }}>No untagged images found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {images.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => handleImageClick(image)}
                    style={{
                      cursor: 'pointer',
                      border: '2px solid #555',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      backgroundColor: '#222'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#4CAF50';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#555';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <img
                      src={image.photo_url}
                      alt={image.description || 'Untagged image'}
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    <div style={{
                      padding: '8px',
                      fontSize: '12px',
                      color: '#aaa',
                      textAlign: 'center'
                    }}>
                      Click to add story & tag "{selectedTag}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with randomize button */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #444',
            backgroundColor: '#333'
          }}>
            <button
              onClick={fetchRandomUntaggedImages}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '10px',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Loading...' : '🔄 Randomize'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default UntaggedImagesSidebar;

