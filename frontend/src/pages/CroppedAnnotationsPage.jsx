// frontend/src/pages/CroppedAnnotationsPage.jsx
// View all cropped regions from bounding box annotations

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import './CroppedAnnotationsPage.css';

function CroppedAnnotationsPage() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [croppedImages, setCroppedImages] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const canvasRef = useRef(null);

    useEffect(() => {
        fetchPost();
    }, [postId]);

    const fetchPost = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/posts/${postId}`);
            setPost(response.data);
            generateCroppedImages(response.data);
        } catch (error) {
            console.error("Error fetching post:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateCroppedImages = (postData) => {
        if (!postData.bounding_box_tags || Object.keys(postData.bounding_box_tags).length === 0) {
            setCroppedImages([]);
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const crops = [];
            Object.entries(postData.bounding_box_tags).forEach(([tagName, box]) => {
                // Set canvas size to crop size
                canvas.width = box.width;
                canvas.height = box.height;

                // Draw cropped region
                ctx.drawImage(
                    img,
                    box.x, box.y, box.width, box.height, // Source
                    0, 0, box.width, box.height // Destination
                );

                crops.push({
                    tagName,
                    box,
                    dataUrl: canvas.toDataURL('image/png'),
                    aspectRatio: box.width / box.height
                });
            });

            setCroppedImages(crops);
        };
        img.src = postData.photo_url;
    };

    const downloadCrop = (crop) => {
        const link = document.createElement('a');
        link.download = `${crop.tagName.replace(/\s+/g, '_')}.png`;
        link.href = crop.dataUrl;
        link.click();
    };

    const downloadAll = () => {
        croppedImages.forEach((crop, idx) => {
            setTimeout(() => downloadCrop(crop), idx * 200);
        });
    };

    if (loading) {
        return (
            <div className="cropped-page loading">
                <div className="spinner"></div>
                <p>Loading annotations...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="cropped-page error">
                <h2>Post not found</h2>
                <Link to="/gallery" className="back-link">← Back to Gallery</Link>
            </div>
        );
    }

    return (
        <div className="cropped-page">
            {/* Header */}
            <header className="cropped-header">
                <div className="header-left">
                    <Link to={`/posts/${postId}`} className="back-link">
                        ← Back to Post
                    </Link>
                    <h1>Cropped Annotations</h1>
                    <span className="crop-count">{croppedImages.length} regions</span>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button
                            className={viewMode === 'grid' ? 'active' : ''}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            ▦
                        </button>
                        <button
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            ☰
                        </button>
                    </div>
                    {croppedImages.length > 0 && (
                        <button className="download-all-btn" onClick={downloadAll}>
                            ⬇️ Download All
                        </button>
                    )}
                </div>
            </header>

            {/* Original Image Preview */}
            <div className="original-preview">
                <img src={post.photo_url} alt="Original" />
                <span className="preview-label">Original Image</span>
            </div>

            {/* Cropped Images Grid/List */}
            {croppedImages.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🏷️</span>
                    <h3>No Annotations Found</h3>
                    <p>Draw bounding boxes on the image to create cropped regions.</p>
                    <Link to={`/posts/${postId}`} className="action-link">
                        Go to Annotation Editor →
                    </Link>
                </div>
            ) : (
                <div className={`crops-container ${viewMode}`}>
                    {croppedImages.map((crop, index) => (
                        <div
                            key={crop.tagName}
                            className={`crop-card ${selectedCrop === index ? 'selected' : ''}`}
                            onClick={() => setSelectedCrop(selectedCrop === index ? null : index)}
                        >
                            <div className="crop-image-container">
                                <img src={crop.dataUrl} alt={crop.tagName} />
                                <div className="crop-overlay">
                                    <button
                                        className="overlay-btn"
                                        onClick={(e) => { e.stopPropagation(); downloadCrop(crop); }}
                                        title="Download"
                                    >
                                        ⬇️
                                    </button>
                                </div>
                            </div>

                            <div className="crop-info">
                                <h3 className="crop-tag">{crop.tagName}</h3>
                                <div className="crop-meta">
                                    <span className="meta-item">
                                        <span className="meta-icon">📐</span>
                                        {crop.box.width} × {crop.box.height}px
                                    </span>
                                    <span className="meta-item">
                                        <span className="meta-icon">📍</span>
                                        ({crop.box.x}, {crop.box.y})
                                    </span>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {selectedCrop === index && (
                                <div className="crop-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Aspect Ratio</span>
                                        <span className="detail-value">{crop.aspectRatio.toFixed(2)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Area</span>
                                        <span className="detail-value">{(crop.box.width * crop.box.height).toLocaleString()}px²</span>
                                    </div>
                                    <div className="crop-actions">
                                        <button onClick={(e) => { e.stopPropagation(); downloadCrop(crop); }}>
                                            Download PNG
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Hidden Canvas for cropping */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}

export default CroppedAnnotationsPage;
