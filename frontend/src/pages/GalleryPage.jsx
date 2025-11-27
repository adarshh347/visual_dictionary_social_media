import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import TagFilter from '../components/TagFilter';
import UntaggedImagesSidebar from '../components/UntaggedImagesSidebar';
import StoryFlow from '../components/StoryFlow';

const API_URL = 'http://127.0.0.1:5007';

function GalleryPage() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTag, setSelectedTag] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // New state for story generation
  const [activePlotIndex, setActivePlotIndex] = useState(null);
  const [userCommentary, setUserCommentary] = useState("");
  const [generatedStory, setGeneratedStory] = useState(null);
  const [loadingStory, setLoadingStory] = useState(false);
  const [showUntaggedSidebar, setShowUntaggedSidebar] = useState(false);

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

  const handleAnalyzeTag = async () => {
    if (!selectedTag) return;
    setLoadingSummary(true);
    setSummaryData(null);
    setActivePlotIndex(null); // Reset active plot
    setGeneratedStory(null); // Reset story
    try {
      const response = await axios.get(`${API_URL}/api/v1/posts/summary/${selectedTag}`);
      setSummaryData(response.data);
    } catch (error) {
      console.error("Error fetching tag analysis:", error);
      setSummaryData({ summary: "Failed to generate summary.", plot_suggestions: [] });
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerateStory = async (plotSuggestion) => {
    setLoadingStory(true);
    setGeneratedStory(null);
    setShowUntaggedSidebar(false); // Reset sidebar when generating new story
    try {
      const response = await axios.post(`${API_URL}/api/v1/posts/summary/generate_story`, {
        tag: selectedTag,
        plot_suggestion: plotSuggestion,
        user_commentary: userCommentary
      });
      setGeneratedStory(response.data.story);
      // Show sidebar when story is generated
      setShowUntaggedSidebar(true);
    } catch (error) {
      console.error("Error generating story:", error);
      alert("Failed to generate story.");
    } finally {
      setLoadingStory(false);
    }
  };

  const handleImageSelect = (image) => {
    // When an image is selected and tagged, we can optionally navigate to it or refresh
    // For now, just show a success message and refresh posts
    fetchPosts(currentPage, selectedTag);
    alert(`Story associated with image! Tag "${selectedTag}" has been added.`);
  };

  useEffect(() => {
    fetchPosts(currentPage, selectedTag);
  }, [currentPage, selectedTag]);

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    setCurrentPage(1);
    setSummaryData(null);
    setActivePlotIndex(null);
    setGeneratedStory(null);
    setShowUntaggedSidebar(false); // Hide sidebar when tag changes
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

      {selectedTag && (
        <div className="tag-analysis-section" style={{ margin: '20px 0', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
          <h3>Analysis for tag: <span style={{ color: '#4CAF50' }}>{selectedTag}</span></h3>

          {!summaryData && !loadingSummary && (
            <button
              onClick={handleAnalyzeTag}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Generate Summary & Plot Suggestions
            </button>
          )}

          {loadingSummary && <p>Analyzing content with AI... Please wait...</p>}

          {summaryData && (
            <div className="analysis-results">
              <div className="summary-box" style={{ marginBottom: '20px' }}>
                <h4>Summary</h4>
                <p style={{ lineHeight: '1.6' }}>{summaryData.summary}</p>
              </div>

              <div className="plots-box">
                <h4>Plot Suggestions</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {summaryData.plot_suggestions.map((plot, index) => (
                    <div key={index} style={{ flex: '1 1 100%', marginBottom: '10px' }}>
                      <button
                        style={{
                          backgroundColor: activePlotIndex === index ? '#4CAF50' : '#333',
                          border: '1px solid #555',
                          color: '#eee',
                          padding: '15px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'all 0.2s',
                          fontSize: '1.1em'
                        }}
                        onClick={() => {
                          if (activePlotIndex === index) {
                            setActivePlotIndex(null); // Toggle off
                          } else {
                            setActivePlotIndex(index);
                            setGeneratedStory(null); // Clear previous story
                            setUserCommentary(""); // Clear previous commentary
                          }
                        }}
                      >
                        <strong>Suggestion {index + 1}:</strong> {plot}
                      </button>

                      {activePlotIndex === index && (
                        <div style={{
                          marginTop: '10px',
                          padding: '15px',
                          backgroundColor: '#383838',
                          borderRadius: '0 0 6px 6px',
                          borderLeft: '4px solid #4CAF50'
                        }}>
                          <p style={{ marginBottom: '10px' }}>Add your commentary or specific instructions for the story:</p>
                          <textarea
                            value={userCommentary}
                            onChange={(e) => setUserCommentary(e.target.value)}
                            placeholder="E.g., Make the tone dark and mysterious, focus on the character's redemption..."
                            style={{
                              width: '100%',
                              minHeight: '80px',
                              padding: '10px',
                              borderRadius: '4px',
                              border: '1px solid #555',
                              backgroundColor: '#222',
                              color: '#fff',
                              marginBottom: '10px',
                              fontFamily: 'inherit'
                            }}
                          />
                          <button
                            onClick={() => handleGenerateStory(plot)}
                            disabled={loadingStory}
                            style={{
                              backgroundColor: '#FF9800',
                              color: 'white',
                              padding: '10px 20px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loadingStory ? 'not-allowed' : 'pointer',
                              fontSize: '16px'
                            }}
                          >
                            {loadingStory ? 'Generating Story...' : 'Generate Full Story'}
                          </button>

                          {generatedStory && (
                            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#222', borderRadius: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h4 style={{ color: '#FF9800', marginTop: 0, marginBottom: 0 }}>Generated Story</h4>
                              </div>
                              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', marginBottom: '0' }}>{generatedStory}</p>
                              <StoryFlow story={generatedStory} detailLevel="med" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Untagged Images Sidebar */}
      <UntaggedImagesSidebar
        isVisible={showUntaggedSidebar}
        onClose={() => setShowUntaggedSidebar(false)}
        onImageSelect={handleImageSelect}
        selectedTag={selectedTag}
        story={generatedStory}
      />
    </div>
  );
}

export default GalleryPage;