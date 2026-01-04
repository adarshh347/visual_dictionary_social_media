import axios from 'axios';
import { API_URL } from '../config/api';

const PHRASE_API_URL = `${API_URL}/api/v1/phrases`;

export const phraseService = {
    /**
     * Generate AI phrase for an image
     */
    async generatePhrase(postId, useMemory = true, style = 'erotic') {
        const response = await axios.post(`${PHRASE_API_URL}/generate`, {
            post_id: postId,
            use_memory: useMemory,
            style: style
        });
        return response.data;
    },

    /**
     * Save user's enhancement to learning database
     */
    async saveEnhancement(originalPhrase, enhancedPhrase, imageContext, tags) {
        const response = await axios.post(`${PHRASE_API_URL}/enhance`, {
            original_phrase: originalPhrase,
            enhanced_phrase: enhancedPhrase,
            image_context: imageContext,
            tags: tags
        });
        return response.data;
    },

    /**
     * Save phrase as text_block to post
     */
    async savePhraseToPost(postId, phrase, blockType = 'paragraph', color = '#2a2a2a') {
        const response = await axios.post(`${PHRASE_API_URL}/save`, {
            post_id: postId,
            phrase: phrase,
            block_type: blockType,
            color: color
        });
        return response.data;
    },

    /**
     * Get learning statistics
     */
    async getStats() {
        const response = await axios.get(`${PHRASE_API_URL}/stats`);
        return response.data;
    }
};
