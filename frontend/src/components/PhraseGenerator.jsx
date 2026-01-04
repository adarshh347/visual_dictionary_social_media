import React, { useState } from 'react';
import { phraseService } from '../services/phraseService';
import './PhraseGenerator.css';

const PhraseGenerator = ({ post, onPhraseSaved }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [phrase, setPhrase] = useState('');
    const [editedPhrase, setEditedPhrase] = useState('');
    const [useMemory, setUseMemory] = useState(true);
    const [style, setStyle] = useState('erotic');
    const [showEnhancement, setShowEnhancement] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await phraseService.generatePhrase(post.id, useMemory, style);
            setPhrase(result.phrase);
            setEditedPhrase(result.phrase);
            setShowEnhancement(true);
        } catch (error) {
            console.error('Error generating phrase:', error);
            alert('Failed to generate phrase');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEnhancement = async () => {
        if (editedPhrase !== phrase) {
            try {
                await phraseService.saveEnhancement(
                    phrase,
                    editedPhrase,
                    post.description || 'Image from gallery',
                    post.general_tags || []
                );
            } catch (error) {
                console.error('Error saving enhancement:', error);
            }
        }
    };

    const handleSaveToPost = async () => {
        setLoading(true);
        try {
            await handleSaveEnhancement();
            await phraseService.savePhraseToPost(post.id, editedPhrase);
            alert('Phrase saved successfully!');
            setIsOpen(false);
            setShowEnhancement(false);
            if (onPhraseSaved) onPhraseSaved();
        } catch (error) {
            console.error('Error saving phrase:', error);
            alert('Failed to save phrase');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button className="phrase-trigger-btn" onClick={() => setIsOpen(true)}>
                ✨ Generate Phrase
            </button>
        );
    }

    return (
        <div className="phrase-generator-overlay" onClick={() => setIsOpen(false)}>
            <div className="phrase-generator-modal" onClick={(e) => e.stopPropagation()}>
                <div className="phrase-header">
                    <h3>AI Phrase Generator</h3>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
                </div>

                {!showEnhancement ? (
                    <div className="phrase-controls">
                        <div className="control-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={useMemory}
                                    onChange={(e) => setUseMemory(e.target.checked)}
                                />
                                Use Learning Memory
                            </label>
                        </div>

                        <div className="control-group">
                            <label>Style</label>
                            <select value={style} onChange={(e) => setStyle(e.target.value)}>
                                <option value="erotic">Erotic</option>
                                <option value="poetic">Poetic</option>
                                <option value="descriptive">Descriptive</option>
                            </select>
                        </div>

                        <button
                            className="generate-btn"
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : '✨ Generate Phrase'}
                        </button>
                    </div>
                ) : (
                    <div className="phrase-editor">
                        <div className="phrase-display">
                            <label>Generated Phrase:</label>
                            <div className="original-phrase">{phrase}</div>
                        </div>

                        <div className="phrase-edit">
                            <label>Edit & Enhance:</label>
                            <textarea
                                value={editedPhrase}
                                onChange={(e) => setEditedPhrase(e.target.value)}
                                rows={4}
                                placeholder="Edit the phrase to match your style..."
                            />
                            <small>Your edits will be learned for future generations</small>
                        </div>

                        <div className="phrase-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowEnhancement(false)}
                            >
                                Regenerate
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSaveToPost}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save to Post'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhraseGenerator;
