"""
Vision Service for Groq Vision API Integration
Handles image analysis and text generation using Groq's vision models.
Follows Single Responsibility Principle - only handles vision-related tasks.
"""

import json
import re
from typing import Optional, Dict, Any
from groq import Groq
from backend.config import settings


class VisionService:
    """
    Service for interacting with Groq Vision API.
    Provides image analysis and text generation capabilities.
    """
    
    def __init__(self):
        """Initialize Groq client with API key from settings."""
        if settings.GROQ_API_KEY:
            self.client = Groq(api_key=settings.GROQ_API_KEY)
            # Using llama-3.2-90b-vision-preview for better quality
            # Can switch to llama-3.2-11b-vision-preview for faster responses
            self.vision_model = "meta-llama/llama-4-scout-17b-16e-instruct"
        else:
            self.client = None
            self.vision_model = None
    
    def _is_available(self) -> bool:
        """Check if vision service is available."""
        return self.client is not None
    
    async def analyze_image(self, image_url: str, prompt: str) -> Optional[str]:
        """
        Analyze an image using Groq Vision API.
        
        Args:
            image_url: URL of the image to analyze
            prompt: The prompt/question to ask about the image
            
        Returns:
            Analysis result as string, or None if service unavailable
        """
        if not self._is_available():
            print("⚠️ Vision service not available - GROQ_API_KEY not set")
            return None
        
        try:
            completion = self.client.chat.completions.create(
                model=self.vision_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url
                                }
                            }
                        ]
                    }
                ],
                temperature=0.7,
                max_tokens=1024,
                top_p=1,
                stream=False
            )
            
            return completion.choices[0].message.content
            
        except Exception as e:
            print(f"❌ Error in vision analysis: {e}")
            return None
    
    async def auto_recommend_text(
        self, 
        image_url: str, 
        existing_text: Optional[str] = None
    ) -> Optional[str]:
        """
        Generate auto-recommended text based on image analysis and existing text.
        
        This mode analyzes the image and creates text that complements
        existing textual information.
        
        Args:
            image_url: URL of the image to analyze
            existing_text: Existing text content for context
            
        Returns:
            Generated text recommendation, or None if service unavailable
        """
        if not self._is_available():
            return None
        
        # Build context-aware prompt
        if existing_text:
            prompt = f"""Analyze this image and generate a descriptive, narrative text that complements the following existing context:

Existing Context:
{existing_text}

Requirements:
1. Describe what you see in the image in vivid, literary detail
2. Connect your description to the existing context naturally
3. Write in a flowing, narrative style (2-4 paragraphs)
4. Focus on visual elements, atmosphere, and mood
5. Make it feel like part of a larger story or essay

Generate the text:"""
        else:
            prompt = """Analyze this image and generate a rich, descriptive narrative text about what you see.

Requirements:
1. Describe the image in vivid, literary detail
2. Write in a flowing, narrative style (2-4 paragraphs)
3. Focus on visual elements, atmosphere, mood, and implied story
4. Make it engaging and evocative
5. Use sensory language and literary devices

Generate the text:"""
        
        return await self.analyze_image(image_url, prompt)
    
    async def prompt_enhanced_text(
        self, 
        image_url: str, 
        user_prompt: str
    ) -> Optional[str]:
        """
        Generate text based on image analysis enhanced by user prompt.
        
        This mode uses the user's specific prompt/direction combined
        with image analysis.
        
        Args:
            image_url: URL of the image to analyze
            user_prompt: User's specific prompt or direction
            
        Returns:
            Generated text based on prompt and image, or None if service unavailable
        """
        if not self._is_available():
            return None
        
        enhanced_prompt = f"""Analyze this image and generate text based on the following user direction:

User Direction:
{user_prompt}

Requirements:
1. Carefully observe all details in the image
2. Follow the user's direction/prompt closely
3. Write in a flowing, narrative style (2-4 paragraphs)
4. Incorporate visual details from the image naturally
5. Make the text vivid and engaging

Generate the text:"""
        
        return await self.analyze_image(image_url, enhanced_prompt)
    
    async def suggest_story_connection(
        self, 
        image_url: str, 
        story_block_content: str
    ) -> Optional[Dict[str, Any]]:
        """
        Analyze how well an image fits with a story block.
        
        Provides a coherence score and explanation for image-text pairing.
        
        Args:
            image_url: URL of the image
            story_block_content: Content of the story block
            
        Returns:
            Dictionary with coherence_score (0-1) and explanation
        """
        if not self._is_available():
            return {"coherence_score": 0.5, "explanation": "Vision service unavailable"}
        
        prompt = f"""Analyze this image in relation to the following story text:

Story Text:
{story_block_content}

Evaluate how well the image matches or complements the story text.

Provide your analysis in the following JSON format:
{{
    "coherence_score": <float between 0 and 1>,
    "explanation": "<brief explanation of the match>",
    "visual_elements": ["<key visual element 1>", "<key visual element 2>", ...],
    "thematic_connections": ["<connection 1>", "<connection 2>", ...]
}}

Respond with ONLY the JSON, no additional text."""
        
        try:
            result = await self.analyze_image(image_url, prompt)
            if result:
                # Try to parse JSON from the response
                # Sometimes LLMs add extra text, so we extract JSON
                json_match = re.search(r'\{.*\}', result, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
                else:
                    # Fallback if JSON parsing fails
                    return {
                        "coherence_score": 0.5,
                        "explanation": result[:200],
                        "visual_elements": [],
                        "thematic_connections": []
                    }
            return None
        except Exception as e:
            print(f"❌ Error in story connection analysis: {e}")
            return {
                "coherence_score": 0.5,
                "explanation": f"Analysis error: {str(e)}",
                "visual_elements": [],
                "thematic_connections": []
            }
    
    async def generate_image_subtitle(self, image_url: str) -> str:
        """
        Generate a short, evocative subtitle for an image.
        Used for epic story blocks to create captions/subtitles.
        
        Args:
            image_url: URL of the image
            
        Returns:
            Short subtitle (1-2 sentences)
        """
        if not self._is_available():
            return ""
        
        prompt = """Analyze this image and create a SHORT, evocative subtitle or caption.

Requirements:
1. Keep it to 1-2 sentences maximum
2. Make it poetic and atmospheric
3. Capture the essence or mood of the image
4. Use vivid, sensory language
5. It should work as a subtitle for a story chapter

Generate ONLY the subtitle, no additional text or explanation:"""
        
        try:
            result = await self.analyze_image(image_url, prompt)
            if result:
                # Clean up the result (remove quotes, extra whitespace)
                subtitle = result.strip().strip('"').strip("'")
                return subtitle
            return ""
        except Exception as e:
            print(f"❌ Error generating subtitle: {e}")
            return ""


# Singleton instance
vision_service = VisionService()
