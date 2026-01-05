import json
from groq import Groq
from backend.config import settings

class EditorLLMService:
    def __init__(self):
        # Initialize Groq client with API key from settings
        if settings.GROQ_API_KEY:
            self.client = Groq(api_key=settings.GROQ_API_KEY)
        else:
            self.client = None
            print("Warning: GROQ_API_KEY not found in settings. Editor LLM features will be disabled.")
            
        # Default text model (can be used for fallbacks)
        self.text_model = "openai/gpt-oss-120b"
        # Vision model
        self.vision_model = "meta-llama/llama-4-maverick-17b-128e-instruct"

    def generate_post_suggestion(self, text_blocks: list, suggestion_type: str, user_commentary: str = "") -> dict:
        """
        Generates suggestions (short prose or story) based on existing text blocks.
        suggestion_type: "short_prose" or "story"
        """
        if not self.client:
            return {"suggestion": "LLM service is not configured (missing GROQ_API_KEY)."}

        # Extract content from text blocks
        content_text = "\n\n".join([block.get("content", "") for block in text_blocks if block.get("content")])
        
        if not content_text.strip():
            return {"suggestion": "No text content available to generate suggestions."}

        if suggestion_type == "short_prose":
            task_instruction = "Write a short, elegant prose piece (2-3 paragraphs) that expands or refines the existing content. Focus on vivid imagery and concise storytelling."
        else:  # story
            task_instruction = "Write a longer, engaging story (4-6 paragraphs) that builds upon the existing content. Include character development, narrative arc, and compelling details."

        prompt = f"""
        You are a creative writer. Based on the following existing text blocks, generate new content.

        EXISTING TEXT BLOCKS:
        {content_text[:5000]}

        USER COMMENTARY/INSTRUCTIONS:
        {user_commentary if user_commentary else "No specific instructions provided."}

        TASK:
        {task_instruction}
        The new content should complement and enhance the existing text, not simply repeat it.

        OUTPUT FORMAT:
        Return ONLY a valid JSON object with the following structure:
        {{
            "suggestion": "Your generated content here..."
        }}
        Do not include any markdown formatting (like ```json) or extra text outside the JSON object.
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that outputs JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.text_model,
                response_format={"type": "json_object"},
            )

            response_content = chat_completion.choices[0].message.content
            return json.loads(response_content)

        except Exception as e:
            print(f"Error in LLM post suggestion generation: {e}")
            return {"suggestion": "Error generating suggestion."}

    def chat_with_vision(self, image_url: str, text_blocks: list, user_message: str, conversation_history: list = None) -> dict:
        """
        Vision-enabled chat that can see the image and understand context.
        Uses Llama 4 Maverick for vision capabilities.
        
        Args:
            image_url: URL of the image to analyze
            text_blocks: Existing text blocks for context
            user_message: User's chat message
            conversation_history: Previous messages in the conversation
            
        Returns:
            Dictionary with 'response' key containing the AI response
        """
        if not self.client:
            return {"response": "LLM service is not configured (missing GROQ_API_KEY)."}

        # Build context from text blocks
        if text_blocks and len(text_blocks) > 0:
            blocks_context = "\n\n".join([
                f"[{block.get('type', 'paragraph')}]: {block.get('content', '')}" 
                for block in text_blocks if block.get('content')
            ])
            context_instruction = "EXISTING TEXT BLOCKS (Use these for context, but prioritize image visuals if they conflict):"
        else:
            blocks_context = "No written content yet. Start fresh based on the image."
            context_instruction = "CONTEXT: The user hasn't written anything yet. Rely heavily on the visual details in the image."

        # Build conversation context
        conv_context = ""
        if conversation_history:
            for msg in conversation_history[-10:]:  # Last 10 messages
                role = "User" if msg.get("role") == "user" else "Assistant"
                conv_context += f"{role}: {msg.get('content', '')}\n"

        system_prompt = """You are a creative writing assistant with vision capabilities. 
You can see the image being referenced and help the user write, edit, and enhance their text content.

CRITICAL INSTRUCTIONS:
1. FOCUS ON THE IMAGE: Use the visual details to ground your writing.
2. NO REPETITION: Do not repeat words like "Page" or "Image" pointlessly.
3. BE CONCISE & HELPUL: Avoid fluff. Go straight to the prose or answer.
4. NO OCR ARTIFACTS: Do not output random page numbers or footer text.

Your responses should be:
- Contextually aware of both the image and existing text
- Creative and engaging
- Helpful for storytelling and prose writing
- Synchronized with what's visible in the image"""

        messages = [
            {"role": "system", "content": system_prompt}
        ]

        # Main user message with image and context
        user_content = [
            {
                "type": "image_url",
                "image_url": {"url": image_url}
            },
            {
                "type": "text", 
                "text": f"""IMAGE CONTEXT: I'm sharing an image with you.

{context_instruction}
{blocks_context}

CONVERSATION SO FAR:
{conv_context}

USER MESSAGE: {user_message}

Please respond helpfully. If I asked for a story or description, write it clearly without repeating yourself."""
            }
        ]

        messages.append({"role": "user", "content": user_content})

        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.vision_model,
                max_tokens=2000,
                temperature=0.7,
            )

            response_content = chat_completion.choices[0].message.content
            return {"response": response_content}

        except Exception as e:
            print(f"Error in vision chat: {e}")
            # Fallback to text-only model
            return self._fallback_text_chat(blocks_context, user_message, conv_context)

    def _fallback_text_chat(self, blocks_context: str, user_message: str, conv_context: str) -> dict:
        """Fallback to text-only chat if vision fails."""
        try:
            prompt = f"""EXISTING TEXT BLOCKS:
{blocks_context}

CONVERSATION SO FAR:
{conv_context}

USER MESSAGE: {user_message}

Please respond helpfully based on the text context provided."""

            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a creative writing assistant helping with prose and storytelling."},
                    {"role": "user", "content": prompt}
                ],
                model=self.text_model,
                max_tokens=2000,
            )

            return {"response": chat_completion.choices[0].message.content}
        except Exception as e:
            print(f"Error in fallback chat: {e}")
            return {"response": "Sorry, I encountered an error. Please try again."}

    def rewrite_with_vision(self, image_url: str, block_content: str, rewrite_instruction: str = "") -> dict:
        """
        Rewrites a text block with awareness of the image content.
        
        Args:
            image_url: URL of the image
            block_content: Current content of the block to rewrite
            rewrite_instruction: Optional specific instructions for rewriting
            
        Returns:
            Dictionary with 'rewritten' key containing the new text
        """
        if not self.client:
            return {"rewritten": "LLM service is not configured (missing GROQ_API_KEY)."}

        instruction = rewrite_instruction if rewrite_instruction else "Enhance and improve this text while keeping it synchronized with what's visible in the image."

        user_content = [
            {
                "type": "image_url",
                "image_url": {"url": image_url}
            },
            {
                "type": "text", 
                "text": f"""Look at this image carefully.

CURRENT TEXT:
{block_content}

INSTRUCTION: {instruction}

Rewrite the text to better describe, relate to, or complement what's visible in the image.
Keep the same general length but improve the quality, imagery, and connection to the visual.

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{{"rewritten": "Your rewritten text here..."}}"""
            }
        ]

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a creative rewriting assistant with vision capabilities. You output JSON."},
                    {"role": "user", "content": user_content}
                ],
                model=self.vision_model,
                max_tokens=1500,
                response_format={"type": "json_object"},
            )

            response_content = chat_completion.choices[0].message.content
            return json.loads(response_content)

        except Exception as e:
            print(f"Error in vision rewrite: {e}")
            return {"rewritten": block_content}  # Return original on error

editor_llm_service = EditorLLMService()
