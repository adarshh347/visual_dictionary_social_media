import React, {useState} from 'react';
import axios from 'axios';

// NOTE: I've corrected a small typo in your API_URL. It had an extra dot.
const API_URL = 'http://127.0.0.1:5007';

function BoundingBoxEditor({post, onUpdate}) {
//     setter function
  const [isDrawing, setIsDrawing] = useState(false);
//     this flag(isDrawing) created by useState hook will be used by other handlers (onMouseMove & onMouseUp)
//     to know when they should actively track the mouse and finalise the box

  const [startCoords, setStartCoords] = useState({x: 0, y: 0});
  const [newBox, setNewBox] = useState(null);
  const [newTagName, setNewTagName] = useState('');

//     we need the keys of the tag object to map over it
  const existingTags = Object.keys(post.bounding_box_tags || {});

//     mouse event handlers below
// REACT SYNTHETIC EVENT- cross browser wrapper around browser's native event system
// it is an object that provides consistent API for handling events across the browsers
// IMP CONCEPT: Event Delegation(event bubbling), Event Pooling
// Event Pooling

//     EVENT HANDLERS
  const handleMouseDown = (event) => {
//         start drawing a new box
    if (newBox && !isDrawing) return;
    setIsDrawing(true);
//         get the coordinates
    const {offsetX, offsetY} = event.nativeEvent;
    setStartCoords({x: offsetX, y: offsetY});
    setNewBox({x: offsetX, y: offsetY, width: 0, height: 0});
  };
// When you attach an event handler like onMouseDown in JSX, React does not use the browser's native event
// system directly. Instead, it creates a SyntheticEvent object (event in your handler).

// nativeEvent: This property points directly to the actual, unmodified DOM Event object that the browser (e.g., Chrome) created
// when the mouse click occurred. This object contains all the browser-specific data, including the real-time
// offsets.
  const handleMouseMove = (event) => {
    if (!isDrawing) return;
    const {offsetX, offsetY} = event.nativeEvent;
    // Calculate width and height, handling dragging in all directions
    const currentX = startCoords.x;
    const currentY = startCoords.y;
    const width = offsetX - currentX;
    const height = offsetY - currentY;

    setNewBox({
      x: width > 0 ? currentX : offsetX,
      y: height > 0 ? currentY : offsetY,
      width: Math.abs(width),
      height: Math.abs(height),
    });
  };
  const handleMouseUp = () => {
    // Stop drawing
    setIsDrawing(false);
  };
// React continuously creates new function calls to handleMouseMove for as long as the mouse is moving and the mouse
// button is held down. It does not wait until the drag ends.
//dikkat wala function
  const handleSaveTag = async () => {
    console.log("--- CHECKPOINT 1: handleSaveTag function started. ---");

    if (!newTagName.trim()) {
      alert('Please enter a name for the tag.');
      return;
    }

    console.log("--- CHECKPOINT 2: Tag name is valid ---", newTagName);

    const updatedTags = {
      ...(post.bounding_box_tags || {}),
      [newTagName]: newBox,
    };

    console.log("--- CHECKPOINT 3: Preparing to send this data to the API ---", updatedTags);

    try {
      await axios.patch(`${API_URL}/api/v1/posts/${post.id}`, {
        bounding_box_tags: updatedTags,
      });

      console.log("--- CHECKPOINT 4: API call successful! ---");

      setNewBox(null);
      setNewTagName('');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('--- CHECKPOINT 5: API call failed! See full error below. ---', error);
      alert('Failed to save tag.');
    }
  };


  return (
    <div className="editor-wrapper">
      <div
        className="bbox-editor-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <img src={post.photo_url} alt={post.description || 'Post image'}/>

        {/* Render existing saved boxes (green) */}
        {existingTags.map((tagName) => {
          const box = post.bounding_box_tags[tagName];
          return (
            <div
              key={tagName}
              className="bounding-box"
              style={{
                left: `${box.x}px`, top: `${box.y}px`,
                width: `${box.width}px`, height: `${box.height}px`,
              }}
            >
              <span className="bbox-label">{tagName}</span>
            </div>
          );
        })}

        {/* Conditionally render the new box as it's being drawn (red) */}
        {newBox && (
          <div
            className="new-bounding-box"
            style={{
              left: `${newBox.x}px`, top: `${newBox.y}px`,
              width: `${newBox.width}px`, height: `${newBox.height}px`,
            }}
          />
        )}
      </div>


      {newBox && !isDrawing && (
        <div className="tag-saver-form">
          <input
            type="text"
            placeholder="Enter tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <button onClick={handleSaveTag}>Save Tag</button>
          <button onClick={() => setNewBox(null)}>Cancel</button>
        </div>
      )}

    </div>
  );
} // <-- The extra closing brace '}' was removed from here. This brace closes the function.

export default BoundingBoxEditor;