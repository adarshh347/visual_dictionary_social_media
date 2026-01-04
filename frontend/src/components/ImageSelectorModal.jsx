import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import './ImageSelectorModal.css';

const ImageSelectorModal = ({ isOpen, onClose, epicId, blockId, onImageSelect }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editedSubtitle, setEditedSubtitle] = useState('');

    useEffect(() => {
        if (isOpen && epicId && blockId) {
            loadSuggestions();
        }
    }, [isOpen, epicId, blockId]);

    const loadSuggestions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${API_URL}/api/v1/epics/${epicId}/blocks/${blockId}/suggest-images`
            );
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error loading image suggestions:', error);
            alert('Failed to load image suggestions');
        } finally {
            setLoading(false);
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setEditedSubtitle(image.suggested_subtitle || '');
    };

    const handleSave = async () => {
        if (!selectedImage) return;

        try {
            // Save the image association with the subtitle
            await onImageSelect(selectedImage.id, editedSubtitle);
            onClose();
        } catch (error) {
            console.error('Error saving image:', error);
            alert('Failed to save image');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content image-selector-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Select Image for Story Block</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading suggestions and generating subtitles...</p>
                    </div>
                ) : (
                    <>
                        <div className="suggestions-grid">
                            {suggestions.map((image) => (
                                <div
                                    key={image.id}
                                    className={`suggestion-card ${selectedImage?.id === image.id ? 'selected' : ''}`}
                                    onClick={() => handleImageClick(image)}
                                >
                                    <div className="image-wrapper">
                                        <img src={image.photo_url} alt="Suggestion" />
                                        {selectedImage?.id === image.id && (
                                            <div className="selected-badge">✓ Selected</div>
                                        )}
                                    </div>
                                    <div className="subtitle-preview">
                                        <small>AI Suggested Subtitle:</small>
                                        <p>{image.suggested_subtitle || 'No subtitle generated'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedImage && (
                            <div className="subtitle-editor">
                                <h3>Edit Subtitle</h3>
                                <textarea
                                    value={editedSubtitle}
                                    onChange={(e) => setEditedSubtitle(e.target.value)}
                                    placeholder="Edit the subtitle for this image..."
                                    rows={3}
                                />
                                <div className="modal-actions">
                                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                                    <button className="btn-primary" onClick={handleSave}>
                                        Save Image & Subtitle
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageSelectorModal;
