import { API_URL } from '../config/api';

const EPIC_API_URL = `${API_URL}/api/v1/epics`;

export const epicService = {
    // --- CRUD ---

    async listEpics(page = 1, limit = 20, status = null) {
        const params = new URLSearchParams({ page, limit });
        if (status) params.append('status', status);

        const response = await fetch(`${EPIC_API_URL}/?${params}`);
        if (!response.ok) throw new Error('Failed to fetch epics');
        return response.json();
    },

    async getEpic(id) {
        const response = await fetch(`${EPIC_API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch epic');
        return response.json();
    },

    async createEpic(data) {
        const response = await fetch(`${EPIC_API_URL}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create epic');
        return response.json();
    },

    async updateEpic(id, data) {
        const response = await fetch(`${EPIC_API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update epic');
        return response.json();
    },

    async deleteEpic(id) {
        const response = await fetch(`${EPIC_API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete epic');
        return true;
    },

    // --- Story Generation ---

    async generateFullStory(data) {
        const response = await fetch(`${EPIC_API_URL}/generate-full`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to generate story');
        return response.json();
    },

    async completeStory(data) {
        const response = await fetch(`${EPIC_API_URL}/complete-story`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to complete story');
        return response.json();
    },

    // --- Image Association ---

    async getSuggestedImages(epicId, blockId, count = 3) {
        const response = await fetch(`${EPIC_API_URL}/${epicId}/suggest-images/${blockId}?count=${count}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        return response.json();
    },

    async associateImage(epicId, blockId, imagePostId, subtitle = '') {
        const response = await fetch(`${EPIC_API_URL}/${epicId}/associate-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                block_id: blockId,
                image_post_id: imagePostId,
                subtitle: subtitle  // Include subtitle in the request
            }),
        });
        if (!response.ok) throw new Error('Failed to associate image');
        return response.json();
    },

    // --- Vision AI ---

    async autoRecommendText(imageUrl, existingText) {
        const response = await fetch(`${EPIC_API_URL}/vision/auto-recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_url: imageUrl,
                existing_text: existingText,
                suggestion_type: 'auto_recommend'
            }),
        });
        if (!response.ok) throw new Error('Failed to generate vision text');
        return response.json();
    },

    async promptEnhancedText(imageUrl, userPrompt) {
        const response = await fetch(`${EPIC_API_URL}/vision/prompt-enhance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_url: imageUrl,
                user_prompt: userPrompt,
                suggestion_type: 'prompt_enhance'
            }),
        });
        if (!response.ok) throw new Error('Failed to generate vision text');
        return response.json();
    }
};
