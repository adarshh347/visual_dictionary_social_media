import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, LayoutList } from 'lucide-react';

import { API_URL } from '../config/api';

/**
 * StoryFlow Component
 * 
 * Displays a visual flow of story events (ev1 → ev2 → ev3).
 * NEW: Nodes are now CLICKABLE - clicking a node opens the AI chatbot
 * with a context-aware literary expansion.
 * 
 * Props:
 * - story: The full story text
 * - detailLevel: "small" | "med" | "big"
 * - imageUrl: URL of the associated image (for node expansion)
 * - onNodeClick: Callback when a node is clicked (receives node text)
 * - showGenerateButton: If true, shows as embedded button (for Story tab)
 */
function StoryFlow({ story, detailLevel = 'med', imageUrl, onNodeClick, showGenerateButton = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDetailLevel, setSelectedDetailLevel] = useState(detailLevel);
  const [activeNode, setActiveNode] = useState(null);

  const generateFlow = async () => {
    if (!story) return;

    setLoading(true);
    setError(null);
    setFlow(null);
    try {
      const response = await axios.post(`${API_URL}/api/v1/posts/summary/generate_story_flow`, {
        story: story,
        detail_level: selectedDetailLevel
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
    setFlow(null);
    setError(null);
  }, [story, selectedDetailLevel]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNodeClick = (nodeText) => {
    setActiveNode(nodeText);
    if (onNodeClick) {
      onNodeClick(nodeText);
    }
  };

  if (!story) return null;

  // Embedded button mode (for Story tab - "Generate Flow" below blocks)
  if (showGenerateButton && !isExpanded) {
    return (
      <button
        onClick={() => {
          setIsExpanded(true);
          generateFlow();
        }}
        className="generate-flow-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'var(--accent-gradient)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 600,
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.2s',
          marginTop: '1.5rem'
        }}
      >
        <LayoutList size={18} />
        Generate Story Flow
      </button>
    );
  }

  return (
    <div style={{
      marginTop: '15px',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--surface-primary)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Expandable Button */}
      <button
        onClick={handleToggle}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: isExpanded ? 'var(--surface-secondary)' : 'var(--surface-primary)',
          border: 'none',
          borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background-color 0.2s'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutList size={16} style={{ color: 'var(--accent-primary)' }} />
          Story Flow Summary
        </span>
        <span style={{ fontSize: '18px', color: 'var(--text-tertiary)' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--bg-primary)'
        }}>
          {/* Detail Level Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Detail Level:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['small', 'med', 'big'].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setSelectedDetailLevel(level);
                    setFlow(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: selectedDetailLevel === level ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                    color: selectedDetailLevel === level ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-pill)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: selectedDetailLevel === level ? 'bold' : 'normal',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Sparkles size={24} className="icon-spin" style={{ color: 'var(--accent-primary)' }} />
              <span>Generating flow...</span>
            </div>
          ) : error ? (
            <p style={{ color: '#ef4444', textAlign: 'center', margin: 0, padding: '1rem' }}>
              {error}
            </p>
          ) : flow ? (
            <div style={{
              color: 'var(--text-primary)',
              lineHeight: '1.8',
              fontSize: '15px'
            }}>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Sparkles size={12} />
                Click a node to explore it with AI
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center'
              }}>
                {flow.split('->').map((event, index, array) => (
                  <span key={index}>
                    <button
                      onClick={() => handleNodeClick(event.trim())}
                      style={{
                        backgroundColor: activeNode === event.trim() ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                        color: activeNode === event.trim() ? '#fff' : 'var(--text-primary)',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: activeNode === event.trim() ? 'var(--shadow-md)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (activeNode !== event.trim()) {
                          e.target.style.borderColor = 'var(--accent-primary)';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = 'var(--shadow-sm)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeNode !== event.trim()) {
                          e.target.style.borderColor = 'var(--border-subtle)';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {event.trim()}
                    </button>
                    {index < array.length - 1 && (
                      <span style={{
                        color: 'var(--accent-primary)',
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
            <div>
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', margin: '0 0 12px 0' }}>
                Select detail level and click to generate flow
              </p>
              <button
                onClick={generateFlow}
                style={{
                  width: '100%',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s'
                }}
              >
                Generate Flow
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StoryFlow;
