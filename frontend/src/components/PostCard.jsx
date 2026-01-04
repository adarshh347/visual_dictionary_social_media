import React from 'react';
import {Link} from 'react-router-dom';

function PostCard({post}){
    return(
        <Link to={`/posts/${post.id}`} className="gallery-item">
        <img src={post.photo_url} alt={post.description || `Post ${post.id}`} />
    </Link>
        );
    }

export default PostCard;
