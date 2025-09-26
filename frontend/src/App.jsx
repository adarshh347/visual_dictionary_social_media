import { useState, useEffect } from 'react';
import axios from 'axios';
import UploadForm from './components/UploadForm';
import './App.css';

const API_URL = 'http://127.0.0.1:5007';

function App() {
    const [posts, setPosts] = useState([]);
    const fetchPosts = async () => {
            try {
                // CORRECTED: Use backticks (`) for the template literal
                const response = await axios.get(`${API_URL}/api/v1/posts/`);
                setPosts(response.data);
            } catch (error) {
                console.error("error fetching posts: ", error);
            }
        };


    useEffect(() => {

        fetchPosts();
    }, []);

    return (
        <div className="app-container">
            <h1>my visual dictionary</h1>
            <UploadForm onUploadSuccess={fetchPosts}/>
            <hr/>
            <div className="gallery-grid">
                {posts.map((post) => (
                    <div key={post.id} className="gallery-item">
                        {/* CORRECTED: Use backticks (`) here as well */}
                        <img src={post.photo_url} alt={`Post ${post.id}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;