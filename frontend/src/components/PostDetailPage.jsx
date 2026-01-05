// frontend/src/components/PostDetailPage.jsx
// LeetCode-style split-screen layout

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Sparkles, Plus, X, ChevronRight, BookOpen, Trash2, Edit, Save, XCircle } from 'lucide-react';
import BoundingBoxEditor from './BoundingBoxEditor';
import RichTextBlock from './RichTextBlock';
import PostSuggestionPanel from './PostSuggestionPanel';
import ChatbotPanel from './ChatbotPanel';
import StoryFlow from './StoryFlow';
import ThemeToggle from './ThemeToggle';
import { API_URL } from '../config/api';
import './PostDetailPage.css';

function PostDetailPage() {
  const [post, setPost] = useState(null);
  const { postId } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedBlocks, setEditedBlocks] = useState([]);
  const [editedTags, setEditedTags] = useState([]);
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [popularTags, setPopularTags] = useState([]);
  const [loadingPopularTags, setLoadingPopularTags] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(45); // percentage
  const [activeLeftTab, setActiveLeftTab] = useState('image');
  const [activeRightTab, setActiveRightTab] = useState('content');
  const [isChatOpen, setIsChatOpen] = useState(false); // AI Sidebar toggle
  const dividerRef = useRef(null);
  const containerRef = useRef(null);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/posts/${postId}`);
      setPost(response.data);
      setEditedBlocks(response.data.text_blocks || []);
      setEditedTags(response.data.general_tags || []);
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  const fetchPopularTags = async () => {
    setLoadingPopularTags(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/posts/tags/popular?limit=10`);
      setPopularTags(response.data);
    } catch (error) {
      console.error("Error fetching popular tags:", error);
    } finally {
      setLoadingPopularTags(false);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchPopularTags();
  }, [postId]);

  // Resizable divider logic
  const isDraggingRef = useRef(false);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dividerRef.current?.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth >= 20 && newWidth <= 80) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        dividerRef.current?.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSave = async () => {
    try {
      const updatePayload = {
        text_blocks: editedBlocks,
        general_tags: editedTags
      };
      await axios.patch(`${API_URL}/api/v1/posts/${postId}`, updatePayload);
      fetchPost();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to save changes.');
    }
  };

  const handleDelete = async () => {
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
    const newBlock = { id: `block_${Date.now()}`, type, content: '', color: 'transparent' };
    setEditedBlocks(currentBlocks => [...currentBlocks, newBlock]);
  };

  const deleteBlock = (id) => {
    setEditedBlocks(currentBlocks => currentBlocks.filter(b => b.id !== id));
  };

  const handleAddTag = () => {
    const newTag = currentTagInput.trim();
    if (newTag && !editedTags.includes(newTag)) {
      setEditedTags([...editedTags, newTag]);
      setCurrentTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddPopularTag = (tag) => {
    if (!editedTags.includes(tag)) {
      setEditedTags([...editedTags, tag]);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    const newBlock = {
      id: `block_${Date.now()}`,
      type: 'paragraph',
      content: suggestion,
      color: 'transparent'
    };
    setEditedBlocks([...editedBlocks, newBlock]);
  };

  const handleTagInputKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddTag();
    }
  };

  if (!post) {
    return (
      <div className="post-detail-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      {/* Top Bar */}
      <div className="post-detail-topbar">
        <Link to="/gallery" className="back-link">
          <ArrowLeft size={18} /> Gallery
        </Link>
        <div className="post-detail-actions">
          <ThemeToggle />
          <button
            className={`action-btn ${isChatOpen ? 'primary' : 'secondary'}`}
            onClick={() => setIsChatOpen(!isChatOpen)}
            title="Toggle AI Assistant"
            style={{ marginRight: '1rem' }}
          >
            <Sparkles size={16} /> AI Assistant
          </button>
          {!isEditing && (
            <button className="action-btn" onClick={() => {
              setIsEditing(true);
              setEditedBlocks(post.text_blocks || []);
              setEditedTags(post.general_tags || []);
            }}>
              <Edit size={16} /> Edit
            </button>
          )}
          <button className="action-btn danger" onClick={handleDelete}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Split Container */}
      <div className="post-detail-split" ref={containerRef}>
        {/* Left Pane - Image */}
        <div className="post-detail-left" style={{ width: `${leftPanelWidth}%` }}>
          <div className="panel-header">
            <h3>Visual</h3>
            <div className="panel-tabs">
              <button
                className={`panel-tab ${activeLeftTab === 'image' ? 'active' : ''}`}
                onClick={() => setActiveLeftTab('image')}
              >
                Image
              </button>
              <button
                className={`panel-tab ${activeLeftTab === 'bbox' ? 'active' : ''}`}
                onClick={() => setActiveLeftTab('bbox')}
              >
                Annotations
              </button>
            </div>
          </div>

          <div className="image-display">
            <BoundingBoxEditor post={post} onUpdate={fetchPost} />
          </div>
        </div>

        {/* Resizable Divider */}
        <div
          className="split-divider"
          ref={dividerRef}
          onMouseDown={handleMouseDown}
          title="Drag to resize"
        ></div>

        {/* Right Pane - Content */}
        <div className="post-detail-right" style={{ width: `${100 - leftPanelWidth}%` }}>
          <div className="panel-header">
            <h3>Content</h3>
            <div className="panel-tabs">
              <button
                className={`panel-tab ${activeRightTab === 'content' ? 'active' : ''}`}
                onClick={() => setActiveRightTab('content')}
              >
                Story
              </button>
              <button
                className={`panel-tab ${activeRightTab === 'flow' ? 'active' : ''}`}
                onClick={() => setActiveRightTab('flow')}
              >
                Flow
              </button>
            </div>
          </div>

          <div className="content-area">
            {/* Epic Association */}
            {post.associated_epics && post.associated_epics.length > 0 && (
              <div className="epic-badge-section">
                <h5>Part of Epic</h5>
                {post.associated_epics.map(epic => (
                  <Link to={`/epics/${epic.epic_id}`} key={epic.epic_id} className="epic-link">
                    <BookOpen size={14} /> {epic.title}
                  </Link>
                ))}
              </div>
            )}

            {activeRightTab === 'content' && (
              <>
                {isEditing ? (
                  <div className="edit-section">
                    <h4>Edit Story Blocks</h4>
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
                    <button className="action-btn text-btn" onClick={() => addBlock('paragraph')} style={{ marginTop: '0.5rem' }}>
                      <Plus size={16} /> Add Block
                    </button>

                    {/* Inline Fallback Suggestion Panel */}
                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                      <h4 style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Legacy Generator</h4>
                      <PostSuggestionPanel
                        textBlocks={editedBlocks}
                        onSuggestionSelect={handleSuggestionSelect}
                      />
                    </div>

                    <div className="edit-section" style={{ marginTop: '1rem' }}>
                      <h4>Tags</h4>
                      <div className="tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        {editedTags.map(tag => (
                          <span key={tag} className="tag-item">
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="remove-tag-btn"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>

                      {popularTags.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Popular: </span>
                          {popularTags.filter(tag => !editedTags.includes(tag)).slice(0, 5).map(tag => (
                            <button
                              key={tag}
                              onClick={() => handleAddPopularTag(tag)}
                              className="popular-tag-btn"
                            >
                              <Plus size={10} /> {tag}
                            </button>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          placeholder="Add tag..."
                          value={currentTagInput}
                          onChange={(e) => setCurrentTagInput(e.target.value)}
                          onKeyDown={handleTagInputKeyDown}
                          className="tag-input"
                        />
                        <button className="action-btn" onClick={handleAddTag}><Plus size={16} /> Add</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {(post.text_blocks || []).map((block) => (
                      <div
                        key={block.id}
                        className="text-block-item"
                        dangerouslySetInnerHTML={{ __html: block.content }}
                        style={{
                          backgroundColor: block.color && block.color !== 'inherit' && block.color !== '#2a2a2a' ? block.color : 'transparent',
                          padding: block.color && block.color !== 'inherit' && block.color !== 'transparent' ? '1rem' : '0 0 0 0.75rem',
                          borderRadius: 'var(--radius-md)'
                        }}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {activeRightTab === 'flow' && post.text_blocks && post.text_blocks.length > 0 && (
              <StoryFlow
                story={post.text_blocks.map(b => b.content).join('\n\n')}
                detailLevel="med"
              />
            )}
          </div>

          {/* Tags display (when not editing) */}
          {!isEditing && (
            <div className="tags-section">
              <h4>Tags</h4>
              <ul className="tags-list">
                {(post.general_tags || []).map((tag) => (
                  <li key={tag} className="tag-item">{tag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Edit actions */}
          {isEditing && (
            <div className="edit-actions">
              <button className="action-btn primary" onClick={handleSave}><Save size={16} /> Save</button>
              <button className="action-btn" onClick={() => {
                setIsEditing(false);
                setEditedTags(post.general_tags || []);
                setEditedBlocks(post.text_blocks || []);
              }}>
                <XCircle size={16} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Slide-out Sidebar */}
      <div className={`ai-sidebar-backdrop ${isChatOpen ? 'open' : ''}`} onClick={() => setIsChatOpen(false)}></div>
      <div className={`ai-sidebar ${isChatOpen ? 'open' : ''}`}>
        <div className="ai-sidebar-content">
          <ChatbotPanel
            imageUrl={post.photo_url}
            textBlocks={isEditing ? editedBlocks : (post.text_blocks || [])}
            onAddBlock={isEditing ? handleSuggestionSelect : undefined}
          />
        </div>
        <button
          className="ai-sidebar-close"
          onClick={() => setIsChatOpen(false)}
          title="Close AI Assistant"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default PostDetailPage;
