import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5007';

function StoryFlow({ story }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateFlow = async () => {
    if (!story || flow) return; // Don't regenerate if already generated
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/v1/posts/summary/generate_story_flow`, {
        story: story
      });
      setFlow(response.data.flow);
    } catch (err) {
      console.error("Error generating story flow:", err);
      setError("Failed to generate story flow.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset flow when story changes
    setFlow(null);
    setError(null);
  }, [story]);

  const handleToggle = () => {
    if (!isExpanded && !flow && !loading) {
      generateFlow();
    }
    setIsExpanded(!isExpanded);
  };

  if (!story) return null;

  return (
    <div style={{
      marginTop: '15px',
      border: '1px solid #555',
      borderRadius: '6px',
      backgroundColor: '#1a1a1a',
      overflow: 'hidden'
    }}>
      {/* Expandable Button */}
      <button
        onClick={handleToggle}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: isExpanded ? '#333' : '#2a2a2a',
          border: 'none',
          borderBottom: isExpanded ? '1px solid #555' : 'none',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background-color 0.2s'
        }}
      >
        <span>📋 Story Flow Summary</span>
        <span style={{ fontSize: '18px' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{
          padding: '16px',
          backgroundColor: '#1a1a1a'
        }}>
          {loading ? (
            <p style={{ color: '#aaa', textAlign: 'center', margin: 0 }}>
              Generating flow...
            </p>
          ) : error ? (
            <p style={{ color: '#f44336', textAlign: 'center', margin: 0 }}>
              {error}
            </p>
          ) : flow ? (
            <div style={{
              color: '#fff',
              lineHeight: '1.8',
              fontSize: '15px'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center'
              }}>
                {flow.split('->').map((event, index, array) => (
                  <span key={index}>
                    <span style={{
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'inline-block'
                    }}>
                      {event.trim()}
                    </span>
                    {index < array.length - 1 && (
                      <span style={{
                        color: '#4CAF50',
                        margin: '0 4px',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        →
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: '#aaa', textAlign: 'center', margin: 0 }}>
              Click to generate flow
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default StoryFlow;

