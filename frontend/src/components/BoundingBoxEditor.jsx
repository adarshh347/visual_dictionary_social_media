import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import './BoundingBoxEditor.css';

function BoundingBoxEditor({ post, onUpdate }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizingTag, setResizingTag] = useState(null);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [newBox, setNewBox] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [hoveredTag, setHoveredTag] = useState(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);
  const isResizingRef = useRef(false);

  const existingTags = Object.keys(post.bounding_box_tags || {});

  // Calculate annotation stats
  const getStats = () => {
    const boxes = post.bounding_box_tags || {};
    const count = Object.keys(boxes).length;
    const imageEl = containerRef.current?.querySelector('img');
    if (!imageEl || count === 0) return { count, coverage: 0 };

    const imageArea = imageEl.width * imageEl.height;
    let annotatedArea = 0;
    Object.values(boxes).forEach(box => {
      annotatedArea += box.width * box.height;
    });
    const coverage = Math.min(100, Math.round((annotatedArea / imageArea) * 100));
    return { count, coverage };
  };

  const stats = getStats();

  const getMousePos = (event) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const handleMouseDown = (event) => {
    if (newBox && !isDrawing) return;
    if (isResizing) return;

    event.preventDefault();
    event.stopPropagation();

    const pos = getMousePos(event);
    isDrawingRef.current = true;
    setIsDrawing(true);
    setStartCoords(pos);
    setNewBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
    setSelectedTag(null);
  };

  const handleMouseMove = (event) => {
    if (isResizingRef.current && resizingTag) {
      handleResize(event);
      return;
    }

    if (!isDrawingRef.current || !newBox) return;

    event.preventDefault();
    const pos = getMousePos(event);
    const width = pos.x - startCoords.x;
    const height = pos.y - startCoords.y;

    setNewBox({
      x: width >= 0 ? startCoords.x : pos.x,
      y: height >= 0 ? startCoords.y : pos.y,
      width: Math.abs(width),
      height: Math.abs(height),
    });
  };

  const handleMouseUp = (event) => {
    if (isResizingRef.current) {
      finishResize();
      return;
    }

    if (!isDrawingRef.current) return;

    event.preventDefault();
    isDrawingRef.current = false;

    if (newBox && (newBox.width > 5 || newBox.height > 5)) {
      setIsDrawing(false);
    } else {
      setIsDrawing(false);
      setNewBox(null);
    }
  };

  const handleMouseLeave = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      setIsDrawing(false);
      setNewBox(null);
    }
    if (isResizingRef.current) {
      finishResize();
    }
  };

  // Resize functionality
  const startResize = (event, tagName, handle) => {
    event.preventDefault();
    event.stopPropagation();
    isResizingRef.current = true;
    setIsResizing(true);
    setResizingTag(tagName);
    setResizeHandle(handle);
    setStartCoords(getMousePos(event));
  };

  const handleResize = (event) => {
    if (!resizingTag || !resizeHandle) return;

    const pos = getMousePos(event);
    const box = { ...post.bounding_box_tags[resizingTag] };
    const dx = pos.x - startCoords.x;
    const dy = pos.y - startCoords.y;

    switch (resizeHandle) {
      case 'nw':
        box.x += dx; box.y += dy;
        box.width -= dx; box.height -= dy;
        break;
      case 'ne':
        box.y += dy;
        box.width += dx; box.height -= dy;
        break;
      case 'sw':
        box.x += dx;
        box.width -= dx; box.height += dy;
        break;
      case 'se':
        box.width += dx; box.height += dy;
        break;
      case 'n':
        box.y += dy; box.height -= dy;
        break;
      case 's':
        box.height += dy;
        break;
      case 'e':
        box.width += dx;
        break;
      case 'w':
        box.x += dx; box.width -= dx;
        break;
    }

    // Ensure minimum size
    if (box.width < 20) box.width = 20;
    if (box.height < 20) box.height = 20;

    setStartCoords(pos);

    // Update local state for immediate feedback
    const updatedTags = { ...post.bounding_box_tags, [resizingTag]: box };
    post.bounding_box_tags = updatedTags;
  };

  const finishResize = async () => {
    if (!resizingTag) return;

    isResizingRef.current = false;
    setIsResizing(false);

    try {
      const box = post.bounding_box_tags[resizingTag];
      const boxWithInts = {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height)
      };

      const updatedTags = { ...post.bounding_box_tags, [resizingTag]: boxWithInts };

      await axios.patch(`${API_URL}/api/v1/posts/${post.id}`, {
        bounding_box_tags: updatedTags
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving resize:', error);
    }

    setResizingTag(null);
    setResizeHandle(null);
  };

  const handleSaveTag = async () => {
    if (!newTagName.trim() || !newBox) return;

    try {
      const boxWithInts = {
        x: Math.round(newBox.x),
        y: Math.round(newBox.y),
        width: Math.round(newBox.width),
        height: Math.round(newBox.height)
      };

      const updatedTags = {
        ...post.bounding_box_tags,
        [newTagName.trim()]: boxWithInts
      };

      await axios.patch(`${API_URL}/api/v1/posts/${post.id}`, {
        bounding_box_tags: updatedTags
      });

      setNewBox(null);
      setNewTagName('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving tag:', error);
      alert('Failed to save tag.');
    }
  };

  const handleDeleteTag = async (tagName) => {
    try {
      const updatedTags = { ...post.bounding_box_tags };
      delete updatedTags[tagName];

      await axios.patch(`${API_URL}/api/v1/posts/${post.id}`, {
        bounding_box_tags: updatedTags
      });

      setSelectedTag(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  return (
    <div className="bbox-editor-wrapper">
      {/* Stats Bar */}
      <div className="bbox-stats-bar">
        <div className="stats-left">
          <span className="stat-item">
            <span className="stat-icon">🏷️</span>
            <span className="stat-value">{stats.count}</span>
            <span className="stat-label">annotations</span>
          </span>
          <span className="stat-item">
            <span className="stat-icon">📊</span>
            <span className="stat-value">{stats.coverage}%</span>
            <span className="stat-label">coverage</span>
          </span>
        </div>
        <div className="stats-actions">
          {existingTags.length > 0 && (
            <Link
              to={`/posts/${post.id}/crops`}
              className="view-crops-btn"
              title="View cropped regions"
            >
              ✂️ View Crops
            </Link>
          )}
          <button
            className={`toggle-visibility ${showAnnotations ? 'active' : ''}`}
            onClick={() => setShowAnnotations(!showAnnotations)}
            title={showAnnotations ? 'Hide annotations' : 'Show annotations'}
          >
            {showAnnotations ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="bbox-editor-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={post.photo_url}
          alt={post.description || 'Post image'}
          draggable={false}
        />

        {/* Existing Boxes with Resize Handles */}
        {showAnnotations && existingTags.map((tagName) => {
          const box = post.bounding_box_tags[tagName];
          if (!box || typeof box.x !== 'number') return null;

          const isHovered = hoveredTag === tagName;
          const isSelected = selectedTag === tagName;

          return (
            <div
              key={tagName}
              className={`bounding-box ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              style={{
                left: `${box.x}px`,
                top: `${box.y}px`,
                width: `${box.width}px`,
                height: `${box.height}px`,
              }}
              onMouseEnter={() => setHoveredTag(tagName)}
              onMouseLeave={() => setHoveredTag(null)}
              onClick={(e) => { e.stopPropagation(); setSelectedTag(tagName); }}
            >
              {/* Label */}
              <span className="bbox-label">{tagName}</span>

              {/* Corner Badges */}
              <div className="corner-badges">
                <button
                  className="corner-badge edit"
                  onClick={(e) => { e.stopPropagation(); setSelectedTag(tagName); }}
                  title="Select"
                >
                  ✏️
                </button>
                <button
                  className="corner-badge delete"
                  onClick={(e) => { e.stopPropagation(); handleDeleteTag(tagName); }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>

              {/* Hover Tooltip */}
              {isHovered && (
                <div className="bbox-tooltip">
                  <strong>{tagName}</strong>
                  <span>{box.width}×{box.height}px</span>
                </div>
              )}

              {/* Resize Handles */}
              {(isSelected || isHovered) && (
                <>
                  <div className="resize-handle nw" onMouseDown={(e) => startResize(e, tagName, 'nw')} />
                  <div className="resize-handle n" onMouseDown={(e) => startResize(e, tagName, 'n')} />
                  <div className="resize-handle ne" onMouseDown={(e) => startResize(e, tagName, 'ne')} />
                  <div className="resize-handle e" onMouseDown={(e) => startResize(e, tagName, 'e')} />
                  <div className="resize-handle se" onMouseDown={(e) => startResize(e, tagName, 'se')} />
                  <div className="resize-handle s" onMouseDown={(e) => startResize(e, tagName, 's')} />
                  <div className="resize-handle sw" onMouseDown={(e) => startResize(e, tagName, 'sw')} />
                  <div className="resize-handle w" onMouseDown={(e) => startResize(e, tagName, 'w')} />
                </>
              )}
            </div>
          );
        })}

        {/* New Box being drawn */}
        {newBox && (
          <div
            className={`new-bounding-box ${isDrawing ? 'drawing' : 'complete'}`}
            style={{
              left: `${newBox.x}px`,
              top: `${newBox.y}px`,
              width: `${newBox.width}px`,
              height: `${newBox.height}px`,
            }}
          />
        )}
      </div>

      {/* Tag Input Form - Glassmorphism */}
      {newBox && !isDrawing && (
        <div className="bbox-tag-form glassmorphism">
          <input
            type="text"
            placeholder="Enter tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTag()}
            autoFocus
          />
          <button className="btn-save" onClick={handleSaveTag}>Save</button>
          <button className="btn-cancel" onClick={() => { setNewBox(null); setNewTagName(''); }}>Cancel</button>
        </div>
      )}

      {/* Tags List - Glassmorphism */}
      {existingTags.length > 0 && (
        <div className="bbox-tags-list glassmorphism">
          <span className="bbox-tags-label">Annotations:</span>
          {existingTags.map(tag => (
            <span
              key={tag}
              className={`bbox-tag-item ${selectedTag === tag ? 'selected' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
              <button onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag); }}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default BoundingBoxEditor;
