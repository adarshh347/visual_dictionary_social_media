// frontend/src/components/RichTextBlock.jsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import React from 'react';

// The toolbar for each block
const MenuBar = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="block-toolbar">
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'is-active' : ''}>P</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}>U</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}>Quote</button>
    </div>
  );
};

function RichTextBlock({ block, onContentChange, onColorChange, onDelete }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: block.content, // Load the HTML content
    onUpdate: ({ editor }) => {
      onContentChange(block.id, editor.getHTML());
    },
  });

  const colorOptions = ['#2a2a2a', '#3E2C41', '#413A2C', '#2C413A'];

  return (
    <div className="rich-text-block" style={{ backgroundColor: block.color || '#2a2a2a' }}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <div className="block-controls">
        <div className="color-picker">
          {colorOptions.map(color => (
            <button key={color} onClick={() => onColorChange(block.id, color)} style={{ backgroundColor: color }} className="color-swatch" />
          ))}
        </div>
        <button onClick={() => onDelete(block.id)} className="delete-block-btn">&times;</button>
      </div>
    </div>
  );
}

export default RichTextBlock;