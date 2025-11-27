import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5007';

function PostSuggestionPanel({ textBlocks, onSuggestionSelect }) {
  const [activeTab, setActiveTab] = useState('short_prose');
  const [userCommentary, setUserCommentary] = useState('');
  const [suggestions, setSuggestions] = useState({
    short_prose: null,
    story: null
  });
  const [loading, setLoading] = useState({
    short_prose: false,
    story: false
  });

  const generateSuggestion = async (type) => {
    if (!textBlocks || textBlocks.length === 0) {
      alert('No text blocks available to generate suggestions.');
      return;
    }

    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const response = await axios.post(`${API_URL}/api/v1/posts/suggestions/generate`, {
        text_blocks: textBlocks,
        suggestion_type: type,
        user_commentary: userCommentary
      });
      
      setSuggestions(prev => ({
        ...prev,
        [type]: response.data.suggestion
      }));
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      alert(`Failed to generate ${type}. Please try again.`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleUseSuggestion = (suggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  return (
    <div style={{
      marginTop: '20px',
      border: '1px solid #555',
      borderRadius: '8px',
      backgroundColor: '#2a2a2a',
      overflow: 'hidden'
    }}>
      {/* Header with Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #555',
        backgroundColor: '#333'
      }}>
        <button
          onClick={() => setActiveTab('short_prose')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            backgroundColor: activeTab === 'short_prose' ? '#4CAF50' : 'transparent',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'short_prose' ? 'bold' : 'normal'
          }}
        >
          Short Prose
        </button>
        <button
          onClick={() => setActiveTab('story')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderLeft: '1px solid #555',
            backgroundColor: activeTab === 'story' ? '#4CAF50' : 'transparent',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'story' ? 'bold' : 'normal'
          }}
        >
          Story
        </button>
      </div>

      {/* Content Area */}
      <div style={{ padding: '16px' }}>
        {/* Commentary Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
            Commentary / Instructions (optional):
          </label>
          <textarea
            value={userCommentary}
            onChange={(e) => setUserCommentary(e.target.value)}
            placeholder="E.g., Make it more dramatic, focus on emotions, add dialogue..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #555',
              backgroundColor: '#222',
              color: '#fff',
              fontFamily: 'inherit',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={() => generateSuggestion(activeTab)}
          disabled={loading[activeTab] || !textBlocks || textBlocks.length === 0}
          style={{
            width: '100%',
            backgroundColor: loading[activeTab] ? '#666' : '#2196F3',
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading[activeTab] ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}
        >
          {loading[activeTab] ? `Generating ${activeTab === 'short_prose' ? 'Short Prose' : 'Story'}...` : `Generate ${activeTab === 'short_prose' ? 'Short Prose' : 'Story'}`}
        </button>

        {/* Suggestion Display */}
        {suggestions[activeTab] && (
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid #444',
            marginBottom: '12px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h4 style={{ margin: 0, color: '#4CAF50', fontSize: '16px' }}>
                {activeTab === 'short_prose' ? 'Short Prose Suggestion' : 'Story Suggestion'}
              </h4>
              <button
                onClick={() => handleUseSuggestion(suggestions[activeTab])}
                style={{
                  backgroundColor: '#FF9800',
                  color: 'white',
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                Use This
              </button>
            </div>
            <p style={{
              color: '#fff',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}>
              {suggestions[activeTab]}
            </p>
          </div>
        )}

        {!suggestions[activeTab] && !loading[activeTab] && (
          <p style={{ color: '#aaa', textAlign: 'center', fontStyle: 'italic', margin: 0 }}>
            Click "Generate" to create a suggestion based on your text blocks.
          </p>
        )}
      </div>
    </div>
  );
}

export default PostSuggestionPanel;

