import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import './PostSuggestionPanel.css';

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
    <div className="legacy-panel">
      {/* Header with Tabs */}
      <div className="legacy-tabs">
        <button
          onClick={() => setActiveTab('short_prose')}
          className={`legacy-tab ${activeTab === 'short_prose' ? 'active' : ''}`}
        >
          Short Prose
        </button>
        <button
          onClick={() => setActiveTab('story')}
          className={`legacy-tab ${activeTab === 'story' ? 'active' : ''}`}
        >
          Story
        </button>
      </div>

      {/* Content Area */}
      <div className="legacy-content">
        {/* Commentary Input */}
        <div className="legacy-form-group">
          <label className="legacy-label">
            Commentary / Instructions (optional):
          </label>
          <textarea
            value={userCommentary}
            onChange={(e) => setUserCommentary(e.target.value)}
            placeholder="E.g., Make it more dramatic, focus on emotions, add dialogue..."
            className="legacy-textarea"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={() => generateSuggestion(activeTab)}
          disabled={loading[activeTab] || !textBlocks || textBlocks.length === 0}
          className="legacy-btn"
        >
          {loading[activeTab] ? `Generating ${activeTab === 'short_prose' ? 'Short Prose' : 'Story'}...` : `Generate ${activeTab === 'short_prose' ? 'Short Prose' : 'Story'}`}
        </button>

        {/* Suggestion Display */}
        {suggestions[activeTab] && (
          <div className="legacy-result">
            <div className="legacy-result-header">
              <h4 className="legacy-result-title">
                {activeTab === 'short_prose' ? 'Short Prose Suggestion' : 'Story Suggestion'}
              </h4>
              <button
                onClick={() => handleUseSuggestion(suggestions[activeTab])}
                className="legacy-use-btn"
              >
                Use This
              </button>
            </div>
            <p className="legacy-text">
              {suggestions[activeTab]}
            </p>
          </div>
        )}

        {!suggestions[activeTab] && !loading[activeTab] && (
          <p className="legacy-empty-msg">
            Click "Generate" to create a suggestion based on your text blocks.
          </p>
        )}
      </div>
    </div>
  );
}

export default PostSuggestionPanel;

