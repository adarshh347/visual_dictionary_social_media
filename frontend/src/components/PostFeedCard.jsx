// frontend/src/components/PostFeedCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function PostFeedCard({ post }) {
  // We'll just show the first text block as a preview
  const previewText = post.text_blocks.length > 0
    ? post.text_blocks[0].content
    : 'No description.';

  return (
    <Link to={`/posts/${post.id}`} className="feed-card">
      <div className="feed-card-image">
        <img src={post.photo_url} alt="Post thumbnail" />
      </div>
      <div className="feed-card-content">
        <p className="feed-card-text">{previewText}</p>
        <div className="feed-card-tags">
          {(post.general_tags || []).map(tag => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
export default PostFeedCard;