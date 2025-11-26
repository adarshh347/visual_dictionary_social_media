import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MAX_PREVIEW_LENGTH = 200; // Character limit for preview

// Helper component for individual text blocks with Show More/Less
function TextBlockPreview({ block }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Strip HTML tags from content for a plain text preview
  const plainText = React.useMemo(() => {
     const tempDiv = document.createElement('div');
     tempDiv.innerHTML = block.content;
     return (tempDiv.textContent || tempDiv.innerText || "").trim();
  }, [block.content]);

  const needsTruncation = plainText.length > MAX_PREVIEW_LENGTH;
  const displayText = isExpanded ? plainText : plainText.slice(0, MAX_PREVIEW_LENGTH);

  // Render nothing if the block has no text content after stripping HTML
  if (!plainText) {
      return null;
  }

  return (
    <div className="text-block-preview" style={{ backgroundColor: block.color || 'transparent' }}>
      <p>
        {displayText}
        {needsTruncation && !isExpanded && '...'}
      </p>
      {needsTruncation && (
        <button
           type="button" // Prevent form submission if nested
           onClick={(e) => {
               e.preventDefault(); // Prevent link navigation when clicking button
               setIsExpanded(!isExpanded);
            }}
           className="expand-button"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
}


function TextPostCard({ post }) {
  // Use the helper for the main preview text (e.g., first block)
  // Or create a combined preview if desired
  const firstTextBlock = (post.text_blocks || [])[0];

  return (
    // Link the whole card to the detail page
    <Link to={`/posts/${post.id}`} className="feed-card">
      <div className="feed-card-image">
        <img src={post.photo_url} alt="Post thumbnail" />
      </div>
      <div className="feed-card-content">
        {/* Display preview using the helper or just the first block's raw content */}
        {firstTextBlock ? (
            <TextBlockPreview block={firstTextBlock} />
         ) : (
            <p className="feed-card-text">No description.</p>
         )}

         <div className="feed-card-tags">
           {(post.general_tags || []).map(tag => (
             <span key={tag} className="tag-pill">{tag}</span>
           ))}
         </div>
          <small className="card-timestamp">
             Updated: {post.updated_at ? new Date(post.updated_at).toLocaleDateString() : 'N/A'}
          </small>
      </div>
    </Link>
  );
}
export default TextPostCard;