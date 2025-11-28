// frontend/src/components/PostDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BoundingBoxEditor from './BoundingBoxEditor';
import RichTextBlock from './RichTextBlock';
import PostSuggestionPanel from './PostSuggestionPanel';
import StoryFlow from './StoryFlow';

// Using a hardcoded URL as requested
import { API_URL } from '../config/api';

function PostDetailPage() {
  const [post, setPost] = useState(null);
  const { postId } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedBlocks, setEditedBlocks] = useState([]);
  const [editedTags, setEditedTags] = useState([]);
  const [currentTagInput, setCurrentTagInput] = useState(''); // <-- State for the tag input field
  const [popularTags, setPopularTags] = useState([]);
  const [loadingPopularTags, setLoadingPopularTags] = useState(false);

  // --- Fetches the latest post data from the backend ---
  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/posts/${postId}`);
      setPost(response.data);
      // Load current data into editing state
      setEditedBlocks(response.data.text_blocks || []);
      setEditedTags(response.data.general_tags || []);
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  // Fetch popular tags
  const fetchPopularTags = async () => {
    setLoadingPopularTags(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/posts/tags/popular?limit=10`);
      setPopularTags(response.data);
    } catch (error) {
      console.error("Error fetching popular tags:", error);
    } finally {
      setLoadingPopularTags(false);
    }
  };

  // Run fetchPost once when the component loads
  useEffect(() => {
    fetchPost();
    fetchPopularTags();
  }, [postId]);

  // --- Saves the updated text blocks AND tags to the backend ---
  const handleSave = async () => {
    try {
      const updatePayload = {
        text_blocks: editedBlocks,
        general_tags: editedTags // Send the updated tags list
      };
      await axios.patch(`${API_URL}/api/v1/posts/${postId}`, updatePayload);
      fetchPost(); // Refresh the data
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to save changes.');
    }
  };

  // --- Deletes the entire post ---
  const handleDelete = async () => {
    // ... (delete logic remains the same)
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`${API_URL}/api/v1/posts/${postId}`);
        alert('Post deleted successfully.');
        navigate('/gallery');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  // --- Handlers for the multi-block editor ---
  const handleBlockContentChange = (id, newContent) => {
    setEditedBlocks(currentBlocks =>
      currentBlocks.map(b => b.id === id ? { ...b, content: newContent } : b)
    );
  };
  const handleBlockColorChange = (id, newColor) => {
    setEditedBlocks(currentBlocks =>
      currentBlocks.map(b => b.id === id ? { ...b, color: newColor } : b)
    );
  };
  const addBlock = (type = 'paragraph') => {
    // ... (addBlock logic remains the same)
    const newBlock = { id: `block_${Date.now()}`, type, content: '', color: '#2a2a2a'};
    setEditedBlocks(currentBlocks => [...currentBlocks, newBlock]);
  };
  const deleteBlock = (id) => {
    setEditedBlocks(currentBlocks => currentBlocks.filter(b => b.id !== id));
  };

  // --- NEW: Handlers for Tag Input ---
  const handleAddTag = () => {
    const newTag = currentTagInput.trim();
    if (newTag && !editedTags.includes(newTag)) { // Check if tag exists and isn't already added
      setEditedTags([...editedTags, newTag]);
      setCurrentTagInput(''); // Clear the input field
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddPopularTag = (tag) => {
    if (!editedTags.includes(tag)) {
      setEditedTags([...editedTags, tag]);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    // Add the suggestion as a new text block
    const newBlock = {
      id: `block_${Date.now()}`,
      type: 'paragraph',
      content: suggestion,
      color: '#2a2a2a'
    };
    setEditedBlocks([...editedBlocks, newBlock]);
  };

  const handleTagInputKeyDown = (event) => {
    // Add tag on Enter or Comma key press
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault(); // Prevent default form submission or comma typing
      handleAddTag();
    }
  };

  // Show a loading state while fetching data
  if (!post) {
    return <div>Loading...</div>;
  }

  // --- The final JSX with the correct layout and editor ---
  return (
    <div className="main-content-card">
      <Link to="/gallery" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
        &larr; Back to Gallery
      </Link>

      <div className="detail-page-layout">
        <div className="image-pane">
          <BoundingBoxEditor post={post} onUpdate={fetchPost} />
        </div>

        <div className="details-pane">
          {isEditing ? (
            // --- Editing Mode ---
            <div>
              <h3>Edit Story</h3>
              <div className="advanced-editor">
                {editedBlocks.map(block => (
                  <RichTextBlock
                    key={block.id}
                    block={block}
                    onContentChange={handleBlockContentChange}
                    onColorChange={handleBlockColorChange}
                    onDelete={deleteBlock}
                  />
                ))}
              </div>
              <button onClick={() => addBlock('paragraph')} style={{ marginTop: '1rem' }}>Add Text Block</button>

              <hr />

              {/* LLM Suggestion Panel */}
              <PostSuggestionPanel
                textBlocks={editedBlocks}
                onSuggestionSelect={handleSuggestionSelect}
              />

              <hr />

              {/* --- NEW Tag Editing UI --- */}
              <h3>Edit General Tags</h3>
              <div className="tags-editor">
                  <div className="tag-pills-container">
                      {editedTags.map(tag => (
                          <span key={tag} className="tag-pill editable">
                              {tag}
                              <button onClick={() => handleRemoveTag(tag)}>&times;</button>
                          </span>
                      ))}
                  </div>
                  
                  {/* Popular Tags */}
                  {popularTags.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
                        Popular Tags (click to add):
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {popularTags
                          .filter(tag => !editedTags.includes(tag))
                          .map(tag => (
                            <button
                              key={tag}
                              onClick={() => handleAddPopularTag(tag)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#1976D2'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#2196F3'}
                            >
                              + {tag}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="add-tag-input-group">
                    <input
                      type="text"
                      placeholder="Add a tag..."
                      value={currentTagInput}
                      onChange={(e) => setCurrentTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown} // Add tag on Enter/Comma
                    />
                    <button onClick={handleAddTag}>Add</button>
                  </div>
              </div>
              {/* ------------------------ */}

              <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSave}>Save Changes</button>
                <button onClick={() => {
                  setIsEditing(false);
                  // Reset editedTags to original post tags on cancel
                  setEditedTags(post.general_tags || []);
                }}>Cancel</button>
              </div>
            </div>
          ) : (
            // --- Display Mode ---
            <div>
              {(post.text_blocks || []).map((block) => (
                <div
                  key={block.id}
                  dangerouslySetInnerHTML={{ __html: block.content }}
                  style={{
                    backgroundColor: block.color || 'transparent',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}
                />
              ))}
              
              {/* Story Flow for individual post */}
              {post.text_blocks && post.text_blocks.length > 0 && (
                <StoryFlow 
                  story={post.text_blocks.map(b => b.content).join('\n\n')} 
                  detailLevel="med" 
                />
              )}

              <button onClick={() => {
                  setIsEditing(true);
                  // Ensure edit state starts with current data
                  setEditedBlocks(post.text_blocks || []);
                  setEditedTags(post.general_tags || []);
              }} style={{ marginTop: '1rem' }}>Edit Post</button>

              <hr />

              <h2>General Tags</h2>
              <ul className="tag-pills-container display-mode"> {/* Use container class for display too */}
                {(post.general_tags || []).map((tag) => (
                   <li key={tag} className="tag-pill">{tag}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="danger-zone" style={{ marginTop: isEditing ? '2rem' : '1rem' }}>
            <button className="delete-button" onClick={handleDelete}>
              Delete Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetailPage;

