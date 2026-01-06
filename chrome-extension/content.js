// Sharirasutra Chrome Extension - Content Script
// Adds a "Save to Sharirasutra" button when hovering over images

(function () {
    'use strict';

    // Configuration
    const API_URL = 'http://localhost:5007/api/v1/posts/upload-from-url';
    const MIN_IMAGE_SIZE = 100; // Minimum image dimension in pixels

    // Create the save button element
    const saveBtn = document.createElement('button');
    saveBtn.className = 'sharirasutra-save-btn';
    saveBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
    <span>Save to Sharirasutra</span>
  `;
    document.body.appendChild(saveBtn);

    let currentImage = null;
    let hideTimeout = null;

    // Check if an element is a valid image worth saving
    function isValidImage(img) {
        if (!img || img.tagName !== 'IMG') return false;

        // Check natural dimensions
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (width < MIN_IMAGE_SIZE || height < MIN_IMAGE_SIZE) return false;

        // Check if it has a valid src
        const src = img.src || img.currentSrc;
        if (!src || src.startsWith('data:image/svg') || src.includes('blank.gif')) return false;

        return true;
    }

    // Get the best image URL
    function getImageUrl(img) {
        // Try to get highest quality version
        return img.currentSrc || img.src || img.dataset.src || '';
    }

    // Position the button near the image
    function positionButton(img) {
        const rect = img.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // Position at top-right of the image
        saveBtn.style.top = `${rect.top + scrollTop + 10}px`;
        saveBtn.style.left = `${rect.right + scrollLeft - saveBtn.offsetWidth - 10}px`;
    }

    // Show the save button
    function showButton(img) {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        currentImage = img;
        img.classList.add('sharirasutra-hover-highlight');
        positionButton(img);
        saveBtn.classList.add('visible');
        saveBtn.classList.remove('success', 'error', 'saving');
        saveBtn.querySelector('span').textContent = 'Save to Sharirasutra';
    }

    // Hide the save button
    function hideButton() {
        hideTimeout = setTimeout(() => {
            if (currentImage) {
                currentImage.classList.remove('sharirasutra-hover-highlight');
            }
            saveBtn.classList.remove('visible');
            currentImage = null;
        }, 300);
    }

    // Handle mouse entering an image
    function handleImageEnter(e) {
        const img = e.target;
        if (isValidImage(img)) {
            showButton(img);
        }
    }

    // Handle mouse leaving an image
    function handleImageLeave(e) {
        hideButton();
    }

    // Keep button visible when hovering over it
    saveBtn.addEventListener('mouseenter', () => {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    });

    saveBtn.addEventListener('mouseleave', () => {
        hideButton();
    });

    // Save image to Sharirasutra
    async function saveImage() {
        if (!currentImage) return;

        const imageUrl = getImageUrl(currentImage);
        if (!imageUrl) {
            showError('Could not get image URL');
            return;
        }

        // Show saving state
        saveBtn.classList.add('saving');
        saveBtn.querySelector('span').textContent = 'Saving...';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_url: imageUrl,
                    general_tags: []
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // Show success
            saveBtn.classList.remove('saving');
            saveBtn.classList.add('success');
            saveBtn.querySelector('span').textContent = '✓ Saved!';

            // Open the post in a new tab (optional)
            // window.open(`http://localhost:5173/post/${data.id}`, '_blank');

        } catch (error) {
            console.error('Sharirasutra save error:', error);
            saveBtn.classList.remove('saving');
            saveBtn.classList.add('error');
            saveBtn.querySelector('span').textContent = '✗ Failed';
        }
    }

    // Click handler
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        saveImage();
    });

    // Add event listeners to all images
    function attachListeners() {
        document.querySelectorAll('img').forEach(img => {
            if (!img.dataset.sharirasutraListening) {
                img.addEventListener('mouseenter', handleImageEnter);
                img.addEventListener('mouseleave', handleImageLeave);
                img.dataset.sharirasutraListening = 'true';
            }
        });
    }

    // Initial attachment
    attachListeners();

    // Watch for new images (for dynamically loaded content)
    const observer = new MutationObserver((mutations) => {
        let hasNewImages = false;
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'IMG' || (node.querySelectorAll && node.querySelectorAll('img').length > 0)) {
                    hasNewImages = true;
                }
            });
        });
        if (hasNewImages) {
            attachListeners();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('🎨 Sharirasutra Image Saver loaded!');
})();
