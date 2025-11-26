import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import UploadForm from '../components/UploadForm';
import TagFilter from '../components/TagFilter';
const API_URL = 'http://127.0.0.1:5007';

function GalleryPage() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTag, setSelectedTag] = useState(null);

  const fetchPosts = async (page, tag) => {
    try {
      let url = `${API_URL}/api/v1/posts?page=${page}&limit=50`;
      if (tag) {
        url += `&tag=${tag}`;
      }
      const response = await axios.get(url);
      setPosts(response.data.posts);
      setTotalPages(response.data.total_pages);
      setCurrentPage(response.data.current_page);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage, selectedTag);
  }, [currentPage, selectedTag]);

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  return (
    <div className="main-content-card">
      <div className="page-header">
        <h1>Explore the Collection</h1>
        <p>"Every image is a story waiting to be told."</p>
      </div>

      <UploadForm onUploadSuccess={() => fetchPosts(1, selectedTag)} />
      <hr style={{ margin: '2rem 0', borderColor: '#444' }} />
      <TagFilter onTagSelect={handleTagSelect} />

      <div className="pagination">
        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
          &larr; Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>
          Next &rarr;
        </button>
      </div>

      <div className="gallery-grid">
        {posts.map((post) => {
          // --- THIS IS THE DEBUGGING LINE ---
          // It will print each post object to the browser console.
          console.log("Inspecting post object:", post);

          return (
            <Link to={`/posts/${post.id}`} key={post.id} className="gallery-item">
              <img src={post.photo_url} alt={post.description || `Post ${post.id}`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default GalleryPage;