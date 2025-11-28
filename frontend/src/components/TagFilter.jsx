import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

function TagFilter({ onTagSelect }) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/posts/tags/`);
        setTags(response.data);
      } catch (error) {
        console.error("Failed to fetch tags", error);
      }
    };
    fetchTags();
  }, []);

  return (
    <div className="tag-filter">
      <button onClick={() => onTagSelect(null)}>All Posts</button>
      {tags.map(tag => (
        <button key={tag} onClick={() => onTagSelect(tag)}>
          {tag}
        </button>
      ))}
    </div>
  );
}
export default TagFilter;