import { Sparkles, Eye, FileText, Trash2, MessageSquare, User, Bot, Plus, Send, Maximize2, Minimize2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import './ChatbotPanel.css';

/**
 * ChatbotPanel - AI Assistant with Vision capabilities
 * 
 * NEW: Supports `initialPrompt` for automatic message generation
 * when opened with context (e.g., from clicking a story flow node).
 * 
 * Props:
 * - imageUrl: URL of the image to analyze
 * - textBlocks: Array of text blocks for context
 * - onAddBlock: Callback to add AI response to text blocks
 * - initialPrompt: (Optional) Auto-send this prompt when panel opens
 * - initialContext: (Optional) Additional context for the initial prompt
 */
function ChatbotPanel({ imageUrl, textBlocks, onAddBlock, initialPrompt, initialContext }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedBlocks, setSelectedBlocks] = useState([]);
    const [showBlockSelector, setShowBlockSelector] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-trigger initial prompt if provided (e.g., from node click)
    useEffect(() => {
        if (initialPrompt && !hasAutoTriggered && imageUrl) {
            setHasAutoTriggered(true);
            handleNodeExpansion(initialPrompt, initialContext);
        }
    }, [initialPrompt, hasAutoTriggered, imageUrl]);

    // Reset auto-trigger when prompt changes
    useEffect(() => {
        setHasAutoTriggered(false);
    }, [initialPrompt]);

    const handleNodeExpansion = async (nodeText, context) => {
        // Add a system message indicating what we're doing
        const systemMessage = {
            role: 'system',
            content: `🎯 Expanding: "${nodeText}"`
        };
        const userMessage = {
            role: 'user',
            content: `Please give me a detailed, literary expansion of this story moment: "${nodeText}"`
        };

        setMessages(prev => [...prev, systemMessage, userMessage]);
        setIsLoading(true);

        try {
            // Use the specialized node expansion endpoint
            const response = await axios.post(`${API_URL}/api/v1/posts/flow/expand-node`, {
                node_text: nodeText,
                image_url: imageUrl,
                story_context: context || textBlocks?.map(b => b.content).join('\n\n') || ''
            });

            const expansion = response.data.expansion || 'Unable to generate expansion.';
            setMessages(prev => [...prev, { role: 'assistant', content: expansion }]);
        } catch (error) {
            console.error('Node expansion error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error while expanding this moment. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message to chat
        const newUserMessage = { role: 'user', content: userMessage };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            // Filter blocks if user selected specific ones
            const blocksToSend = selectedBlocks.length > 0
                ? textBlocks.filter((_, idx) => selectedBlocks.includes(idx))
                : textBlocks;

            const response = await axios.post(`${API_URL}/api/v1/posts/chat/vision`, {
                image_url: imageUrl,
                text_blocks: blocksToSend.map(b => ({
                    id: b.id,
                    type: b.type || 'paragraph',
                    content: b.content,
                    color: b.color || null
                })),
                user_message: userMessage,
                conversation_history: messages.filter(m => m.role !== 'system').map(m => ({
                    role: m.role,
                    content: m.content
                }))
            });

            const aiResponse = response.data.response || 'Sorry, I could not generate a response.';
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAddToBlocks = (content) => {
        if (onAddBlock) {
            onAddBlock(content);
        }
    };

    const toggleBlockSelection = (idx) => {
        setSelectedBlocks(prev =>
            prev.includes(idx)
                ? prev.filter(i => i !== idx)
                : [...prev, idx]
        );
    };

    const clearChat = () => {
        setMessages([]);
        setSelectedBlocks([]);
        setHasAutoTriggered(false);
    };

    return (
        <div className={`chatbot-panel ${isExpanded ? 'expanded' : ''}`}>
            {/* Header */}
            <div className="chatbot-header">
                <div className="header-left">
                    <Sparkles className="chatbot-icon icon-spin" size={20} />
                    <span className="chatbot-title">AI Assistant</span>
                    {imageUrl && (
                        <div className="vision-badge">
                            <Eye size={14} />
                            <span>Vision</span>
                        </div>
                    )}
                </div>
                <div className="header-actions">
                    <button
                        className="expand-btn"
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? "Collapse panel" : "Expand panel"}
                    >
                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button
                        className={`context-btn ${showBlockSelector ? 'active' : ''}`}
                        onClick={() => setShowBlockSelector(!showBlockSelector)}
                        title="Select context blocks"
                    >
                        <FileText size={16} />
                        <span>Context</span>
                        {selectedBlocks.length > 0 && <span className="badge-count">{selectedBlocks.length}</span>}
                    </button>
                    <button className="clear-btn" onClick={clearChat} title="Clear chat">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Block Selector */}
            {showBlockSelector && textBlocks && textBlocks.length > 0 && (
                <div className="block-selector">
                    <span className="selector-label">Include in context:</span>
                    <div className="selector-blocks">
                        {textBlocks.map((block, idx) => (
                            <label key={block.id || idx} className="block-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedBlocks.includes(idx)}
                                    onChange={() => toggleBlockSelection(idx)}
                                />
                                <span className="block-preview">
                                    {block.content?.substring(0, 40)}...
                                </span>
                            </label>
                        ))}
                    </div>
                    <button
                        className="select-all-btn"
                        onClick={() => setSelectedBlocks(selectedBlocks.length === textBlocks.length ? [] : textBlocks.map((_, i) => i))}
                    >
                        {selectedBlocks.length === textBlocks.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
            )}

            {/* Messages Area */}
            <div className="chatbot-messages">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <MessageSquare className="empty-icon" size={48} />
                        <p>Ask me anything about this image or your text.</p>
                        <p className="hint">I can see the image and help you write, edit, or expand your content.</p>
                        <p className="hint" style={{ marginTop: '0.5rem', color: 'var(--accent-primary)' }}>
                            💡 Tip: Click on a story flow node to explore it in detail!
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.role}`}>
                            {msg.role !== 'system' && (
                                <div className="message-avatar">
                                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                </div>
                            )}
                            <div className={`message-content ${msg.role === 'system' ? 'system-message' : ''}`}>
                                <div className="message-text">{msg.content}</div>
                                {msg.role === 'assistant' && (
                                    <button
                                        className="add-to-blocks-btn"
                                        onClick={() => handleAddToBlocks(msg.content)}
                                        title="Add this response as a new text block"
                                    >
                                        <Plus size={14} /> Add to Blocks
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="chat-message assistant loading">
                        <div className="message-avatar"><Bot size={18} /></div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chatbot-input">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about the image or request content..."
                    rows={1}
                    disabled={isLoading}
                />
                <button
                    className="send-btn"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                >
                    {isLoading ? <span className="loading-dot">.</span> : <Send size={18} />}
                </button>
            </div>
        </div>
    );
}

export default ChatbotPanel;
