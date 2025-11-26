import React, { useState } from 'react';
import axios from 'axios';

// NOTE: Ensure your API_URL is correct
const API_URL = 'http://127.0.0.1:5007';

function BoundingBoxEditor({ post, onUpdate }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [newBox, setNewBox] = useState(null);
  const [newTagName, setNewTagName] = useState('');

  const existingTags = Object.keys(post.bounding_box_tags || {});

  // --- CORRECTED Mouse Event Handlers using getBoundingClientRect ---
  const handleMouseDown = (event) => {
    if (newBox && !isDrawing) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setIsDrawing(true);
    setStartCoords({ x: x, y: y });
    setNewBox({ x: x, y: y, width: 0, height: 0 });
  };

  const handleMouseMove = (event) => {
    if (!isDrawing || !newBox) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;
    const startX = startCoords.x;
    const startY = startCoords.y;
    const width = currentX - startX;
    const height = currentY - startY;

    setNewBox({
      x: width >= 0 ? startX : currentX,
      y: height >= 0 ? startY : currentY,
      width: Math.abs(width),
      height: Math.abs(height),
    });
  };

  const handleMouseUp = () => {
    console.log("Mouse Up Triggered. Current newBox:", newBox); // Log 1
    if (newBox && (newBox.width > 1 || newBox.height > 1)) { // Added threshold > 1px
       setIsDrawing(false);
       console.log("Finished drawing a valid box. Setting isDrawing to false."); // Log 2
    } else {
       setIsDrawing(false);
       setNewBox(null);
       console.log("Box too small or invalid. Setting isDrawing to false and newBox to null."); // Log 3
    }
  };
  // --- End of Corrected Mouse Handlers ---

  const handleSaveTag = async () => { /* ... Your save logic is correct ... */ };

  // --- The Return Statement with Debug Log ---
  return (
    <div className="editor-wrapper">
      <div
        className="bbox-editor-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { // Also log when mouse leaves
             if (isDrawing) {
                 console.log("Mouse left container while drawing, cancelling.");
                 setIsDrawing(false);
                 setNewBox(null); // Cancel draw if mouse leaves
             }
        }}
      >
        <img src={post.photo_url} alt={post.description || 'Post image'}/>

        {/* Render existing saved boxes (green) */}
        {existingTags.map((tagName) => {
          const box = post.bounding_box_tags[tagName];
          // Basic check for valid box data
          if (!box || typeof box.x !== 'number' || typeof box.y !== 'number' || typeof box.width !== 'number' || typeof box.height !== 'number') {
              console.warn("Skipping rendering invalid existing box data:", tagName, box);
              return null; // Don't render if data is bad
          }
          return (
            <div
              key={tagName}
              className="bounding-box"
              style={{
                left: `${box.x}px`, top: `${box.y}px`,
                width: `${box.width}px`, height: `${box.height}px`,
              }}
            ><span className="bbox-label">{tagName}</span></div>
          );
        })}

        {/* Conditionally render the new box */}
        {newBox && (
          <div
            className="new-bounding-box"
            style={{
              left: `${newBox.x}px`, top: `${newBox.y}px`,
              width: `${newBox.width}px`, height: `${newBox.height}px`,
              // Style differently based on drawing state
              borderColor: isDrawing ? '#ff0000' : '#ff8c00', // Red while drawing, Orange after
            }}
          />
        )}
      </div>

      {/* --- Debug Log for Form Rendering Condition --- */}
      {console.log("Checking form render condition:", { hasNewBox: !!newBox, isDrawing: isDrawing })} {/* Log 4 */}

      {/* Show the save form only after a box is drawn and mouse is up */}
      {newBox && !isDrawing && (
        <div className="tag-saver-form">
          <input
            type="text"
            placeholder="Enter tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <button onClick={handleSaveTag}>Save Tag</button>
          <button onClick={() => { setNewBox(null); setNewTagName(''); }}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default BoundingBoxEditor;