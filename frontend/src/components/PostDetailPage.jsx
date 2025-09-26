import { useState, useEffect } from 'react';

import {useParams, Link} from 'react-router-dom';
// useParams and Link are two new react hooks to learn - essential for routing in React based applications
// react-router-dom is library for client side routing- it allows us to build single page application
// with multiple view or pages that update based on url without requiring a full page reload

import axios from 'axios';
const API_URL = 'http://127.0.0.1:5007';

function PostDetailPage(){
    const [post, setPost] = useState(null);
    const {postId} = useParams();

    useEffect(()=>{
        const fetchPost = async () =>{
            try{
                const response = await axios.get(`${API_URL}/api/v1/posts/${postId}`);
                setPost(response.data);
                } catch(error){
                    console.error("Error fetching post:", error);
                    }
            };
        fetchPost();
        },[postId] ); //Re-run the effect if postId changes

    if(!post){
    return <div>Loading...</div>; // Show a loading message
  }

  return (
      <div className="detail-container">
          <Link to="/">&larr; Back to Gallery</Link>
          <h1> Post Details </h1>
          <div className="post-detail-content">
              <img src={post.photo_url} alt={post.description || `Post ${post.id}`} />
              <div>
                  <h2>Description</h2>
                  <p> {post.description || 'No description provided'} </p>
                  <h2> General Tags </h2>
                  <ul>
                        {post.general_tags.map(tag => <li key={tag}>{tag}</li>)}
                      </ul>
                  </div>
                  </div>
              </div>
      )
    }
export default PostDetailPage;