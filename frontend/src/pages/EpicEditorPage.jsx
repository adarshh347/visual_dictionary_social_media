import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { epicService } from '../services/epicService';
import ImageSelectorModal from '../components/ImageSelectorModal';
import './EpicEditorPage.css';

const EpicEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [epic, setEpic] = useState(null);
    const [loading, setLoading] = useState(!isNew);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        source_tags: '',
        generation_prompt: '',
        user_commentary: '',
        use_all_text: false
    });

    useEffect(() => {
        if (!isNew) {
            loadEpic(id);
        }
    }, [id, isNew]);

    const loadEpic = async (epicId) => {
        try {
            const data = await epicService.getEpic(epicId);
            setEpic(data);
        } catch (error) {
            console.error("Error loading epic:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                source_tags: formData.source_tags.split(',').map(t => t.trim()).filter(Boolean),
                generation_prompt: formData.generation_prompt,
                user_commentary: formData.user_commentary,
                use_all_text: formData.use_all_text
            };

            const newEpic = await epicService.generateFullStory(payload);
            navigate(`/epics/${newEpic.id}`);
        } catch (error) {
            console.error("Error creating epic:", error);
            alert("Failed to generate epic. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddImage = (blockId) => {
        setSelectedBlockId(blockId);
        setModalOpen(true);
    };

    const handleImageSelect = async (imageId, subtitle) => {
        try {
            // Associate image with block and save subtitle as text_block
            await epicService.associateImage(epic.id, selectedBlockId, imageId, subtitle);
            // Reload epic to show updated data
            await loadEpic(epic.id);
        } catch (error) {
            console.error('Error associating image:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="epic-editor-loading">
                <div className="spinner"></div>
                <p>{isNew ? "Generating your epic story..." : "Loading epic..."}</p>
                {isNew && <small>This may take a minute as AI crafts your narrative.</small>}
            </div>
        );
    }

    if (isNew) {
        return (
            <div className="epic-editor-page">
                <div className="editor-container">
                    <h1>Create New Epic</h1>
                    <form onSubmit={handleCreate} className="creation-form">
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter a title for your epic"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Brief description of what this epic is about"
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label>Source Tags (comma separated)</label>
                            <input
                                type="text"
                                name="source_tags"
                                value={formData.source_tags}
                                onChange={handleInputChange}
                                placeholder="e.g. travel, japan, nature"
                            />
                            <small>Leave empty to use all posts if "Use All Text" is checked.</small>
                        </div>

                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="use_all_text"
                                    checked={formData.use_all_text}
                                    onChange={handleInputChange}
                                />
                                Use text from all posts (ignore tags)
                            </label>
                        </div>

                        <div className="form-group">
                            <label>Story Direction / Prompt</label>
                            <textarea
                                name="generation_prompt"
                                value={formData.generation_prompt}
                                onChange={handleInputChange}
                                placeholder="e.g. Write a mystery story set in these locations..."
                                rows={4}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Additional Commentary</label>
                            <textarea
                                name="user_commentary"
                                value={formData.user_commentary}
                                onChange={handleInputChange}
                                placeholder="Any specific style or details to include?"
                                rows={3}
                            />
                        </div>

                        <button type="submit" className="submit-btn">Generate Epic Story</button>
                    </form>
                </div>
            </div>
        );
    }

    if (!epic) return <div>Epic not found</div>;

    return (
        <div className="epic-editor-page">
            <div className="editor-header">
                <h1>{epic.title}</h1>
                <div className="meta-info">
                    <span>{epic.metadata.total_blocks} Blocks</span>
                    <span>{epic.status}</span>
                </div>
            </div>

            <div className="story-blocks">
                {epic.story_blocks.map((block, index) => (
                    <div key={block.block_id} className="story-block">
                        <div className="block-content">
                            <span className="block-number">{index + 1}</span>
                            <p>{block.content}</p>
                        </div>

                        <div className="block-image-section">
                            {block.image_url ? (
                                <div className="associated-image">
                                    <img src={block.image_url} alt="Associated scene" />
                                    {block.subtitle && (
                                        <div className="image-subtitle">
                                            {block.subtitle}
                                        </div>
                                    )}
                                    <div className="image-overlay">
                                        <button onClick={() => handleAddImage(block.block_id)}>
                                            Change
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="image-placeholder">
                                    <button onClick={() => handleAddImage(block.block_id)}>
                                        + Add Image
                                    </button>
                                    <p>Click to select from AI suggestions</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ImageSelectorModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                epicId={epic.id}
                blockId={selectedBlockId}
                onImageSelect={handleImageSelect}
            />
        </div>
    );
};

export default EpicEditorPage;
