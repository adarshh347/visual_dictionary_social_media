// useParams and Link are two new react hooks to learn - essential for routing in React based applications
// react-router-dom is library for client side routing- it allows us to build single page application
// with multiple view or pages that update based on url without requiring a full page reload

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import BoundingBoxEditor from './BoundingBoxEditor';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5007';

function PostDetailPage() {
  const [post, setPost] = useState(null);
  const { postId } = useParams();
  const navigate = useNavigate(); // Hook for navigation

  // State for inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/posts/${postId}`);
      setPost(response.data);
      setEditedDescription(response.data.description || ''); // Initialize edit field
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleDelete = async () => {
    // Confirm before deleting
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`${API_URL}/api/v1/posts/${postId}`);
        alert('Post deleted successfully.');
        navigate('/'); // Redirect to the home page (gallery)
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  const handleSave = async () => {
    try {
      await axios.patch(`${API_URL}/api/v1/posts/${postId}`, {
        description: editedDescription,
      });
      // Refresh the post data and exit editing mode
      fetchPost();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to save changes.');
    }
  };


  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="detail-container">
      <Link to="/">&larr; Back to Gallery</Link>
      <h1>Post Details</h1>
      <div className="post-detail-content">

        <div className="image-section">
           <BoundingBoxEditor post={post} />
        </div>


        <div>
          <h2>Description</h2>
          {isEditing ? (
            <div>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows="5"
              />
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div>
              <p>{post.description || 'No description provided.'}</p>
              <button onClick={() => setIsEditing(true)}>Edit Description</button>
            </div>
          )}

          <h2>General Tags</h2>
          <ul>
            {post.general_tags.map(tag => <li key={tag}>{tag}</li>)}
          </ul>

          <div className="danger-zone">
            <button className="delete-button" onClick={handleDelete}>Delete Post</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetailPage;