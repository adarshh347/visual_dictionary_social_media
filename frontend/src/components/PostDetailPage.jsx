// frontend/src/components/PostDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BoundingBoxEditor from './BoundingBoxEditor';
import RichTextBlock from './RichTextBlock';

// Using a hardcoded URL as requested
const API_URL = 'http://127.0.0.1:5007';

function PostDetailPage() {
  const [post, setPost] = useState(null);
  const { postId } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedBlocks, setEditedBlocks] = useState([]);
  const [editedTags, setEditedTags] = useState([]);
  const [currentTagInput, setCurrentTagInput] = useState(''); // <-- State for the tag input field

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

  // Run fetchPost once when the component loads
  useEffect(() => {
    fetchPost();
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

