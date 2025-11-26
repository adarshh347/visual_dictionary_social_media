// frontend/src/components/MultiBlockEditor.jsx
import React from 'react';

function MultiBlockEditor({ blocks, setBlocks }) {

  // Function to update a specific block's content
  const handleContentChange = (id, newContent) => {
    const updatedBlocks = blocks.map(block =>
      block.id === id ? { ...block, content: newContent } : block
    );
    setBlocks(updatedBlocks);
  };

  // Function to add a new block
  const addBlock = (type) => {
    const newBlock = {
      id: `block_${Date.now()}`, // Simple unique ID
      type: type,
      content: ''
    };
    setBlocks([...blocks, newBlock]);
  };

  // Function to delete a block
  const deleteBlock = (id) => {
    const updatedBlocks = blocks.filter(block => block.id !== id);
    setBlocks(updatedBlocks);
  };

  return (
    <div className="multi-block-editor">
      {blocks.map(block => (
        <div key={block.id} className="text-block">
          <textarea
            placeholder={`Enter ${block.type}...`}
            value={block.content}
            onChange={(e) => handleContentChange(block.id, e.target.value)}
            rows={block.type === 'h1' ? 1 : 3}
          />
          <button onClick={() => deleteBlock(block.id)} className="delete-block-btn">&times;</button>
        </div>
      ))}
      <div className="add-block-buttons">
        <button onClick={() => addBlock('h1')}>Add Heading</button>
        <button onClick={() => addBlock('paragraph')}>Add Paragraph</button>
        <button onClick={() => addBlock('quote')}>Add Quote</button>
      </div>
    </div>
  );
}
export default MultiBlockEditor;