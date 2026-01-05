import json
from groq import Groq
from backend.config import settings

class LLMService:
    def __init__(self):
        # Initialize Groq client with API key from settings
        if settings.GROQ_API_KEY:
            self.client = Groq(api_key=settings.GROQ_API_KEY)
        else:
            self.client = None
            print("Warning: GROQ_API_KEY not found in settings. LLM features will be disabled.")
            
        # Model can be easily switched here
        self.model = "openai/gpt-oss-120b"

    def generate_summary_and_plots(self, text_content: str) -> dict:
        """
        Analyzes the provided text content to generate a summary and plot suggestions.
        Returns a dictionary with 'summary' and 'plot_suggestions'.
        """
        if not self.client:
            return {
                "summary": "LLM service is not configured (missing GROQ_API_KEY).",
                "plot_suggestions": []
            }

        if not text_content.strip():
            return {
                "summary": "No text content available to summarize.",
                "plot_suggestions": []
            }

        prompt = f"""
        You are a creative assistant. Analyze the following text content extracted from posts:

        TEXT CONTENT:
        {text_content[:10000]}  # Limit content length to avoid token limits if necessary

        TASKS:
        1. Summarize the main themes and details in the text.
        2. Generate 5 creative, distinct plot suggestions or story ideas based on this content.

        OUTPUT FORMAT:
        Return ONLY a valid JSON object with the following structure:
        {{
            "summary": "Your summary here...",
            "plot_suggestions": [
                "Plot idea 1...",
                "Plot idea 2...",
                "Plot idea 3...",
                "Plot idea 4...",
                "Plot idea 5..."
            ]
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
                model=self.model,
                response_format={"type": "json_object"},
            )

            response_content = chat_completion.choices[0].message.content
            return json.loads(response_content)

        except Exception as e:
            print(f"Error in LLM generation: {e}")
            return {
                "summary": "Error generating summary.",
                "plot_suggestions": ["Error generating suggestions."]
            }

    def generate_story_from_plot(self, aggregated_text: str, plot_suggestion: str, user_commentary: str) -> dict:
        """
        Generates a long story based on the aggregated text, a specific plot suggestion, and user commentary.
        """
        if not self.client:
            return {"story": "LLM service is not configured (missing GROQ_API_KEY)."}

        prompt = f"""
        You are a creative storyteller. Write a compelling, long-form story based on the following inputs:

        1. BACKGROUND CONTEXT (from existing posts):
        {aggregated_text[:5000]}

        2. PLOT SUGGESTION (core idea):
        {plot_suggestion}

        3. USER'S COMMENTARY/ENHANCER (specific direction):
        {user_commentary}

        TASK:
        Weave these elements together into a cohesive, engaging narrative. 
        - Use the background context to establish the world and tone.
        - Use the plot suggestion as the main narrative arc.
        - Incorporate the user's commentary to refine the style, add specific details, or guide the character development as requested.
        
        OUTPUT FORMAT:
        Return ONLY a valid JSON object with the following structure:
        {{
            "story": "Your long generated story here..."
        }}
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
                model=self.model,
                response_format={"type": "json_object"},
            )

            response_content = chat_completion.choices[0].message.content
            return json.loads(response_content)

        except Exception as e:
            print(f"Error in LLM story generation: {e}")
            return {"story": "Error generating story."}

    def generate_story_flow(self, story: str, detail_level: str = "med") -> dict:
        """
        Generates a summarized flow of the story in phrases/keywords (ev1->ev2->ev3 format).
        detail_level: "small" (3-5 events), "med" (5-10 events), "big" (10-15 events)
        """
        if not self.client:
            return {"flow": "LLM service is not configured (missing GROQ_API_KEY)."}

        # Determine event count based on detail level
        if detail_level == "small":
            event_range = "3-5"
            detail_instruction = "Keep it very concise, focusing only on the most critical moments."
        elif detail_level == "big":
            event_range = "10-15"
            detail_instruction = "Include more nuanced details and sub-events to capture the full narrative arc."
        else:  # med
            event_range = "5-10"
            detail_instruction = "Provide a balanced overview of key moments."

        prompt = f"""
        You are a story analyzer. Analyze the following story and break it down into a sequential flow of key events/phrases.

        STORY:
        {story[:8000]}

        TASK:
        Break down the story into {event_range} key events or phrases that represent the story's progression.
        {detail_instruction}
        Each event should be a brief phrase or keyword (2-5 words max).
        Format them as a sequential flow: ev1->ev2->ev3->ev4->...

        OUTPUT FORMAT:
        Return ONLY a valid JSON object with the following structure:
        {{
            "flow": "ev1->ev2->ev3->ev4->ev5"
        }}
        
        Where each 'ev' is a brief phrase or keyword representing a key moment in the story.
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
                model=self.model,
                response_format={"type": "json_object"},
            )

            response_content = chat_completion.choices[0].message.content
            return json.loads(response_content)

        except Exception as e:
            print(f"Error in LLM story flow generation: {e}")
            return {"flow": "Error generating story flow."}



    def generate_epic_story(self, aggregated_text: str, generation_prompt: str, user_commentary: str = "", source_tags: list = None) -> dict:
        """
        Generates a long-form epic story based on aggregated text from posts.
        This is specifically for the Epic/Novel feature.
        
        Args:
            aggregated_text: Combined text from selected posts
            generation_prompt: Main prompt/direction for the story
            user_commentary: Additional user input/direction
            source_tags: Tags used to source the content
            
        Returns:
            Dictionary with 'story' key containing the generated epic
        """
        if not self.client:
            return {"story": "LLM service is not configured (missing GROQ_API_KEY)."}

        tag_context = f"Source tags: {', '.join(source_tags)}" if source_tags else "No specific tags"
        
        prompt = f"""
        You are a master storyteller creating an epic, long-form narrative.
        
        CONTEXT FROM EXISTING CONTENT:
        {aggregated_text[:8000]}
        
        {tag_context}
        
        STORY DIRECTION/PROMPT:
        {generation_prompt}
        
        USER'S ADDITIONAL COMMENTARY:
        {user_commentary if user_commentary else "No additional commentary"}
        
        TASK:
        Create a rich, engaging epic story that:
        1. Draws inspiration from the existing content context
        2. Follows the story direction/prompt provided
        3. Incorporates the user's commentary and preferences
        4. Is substantial in length (1500-3000 words)
        5. Has clear narrative structure with beginning, development, and conclusion
        6. Uses vivid, literary language and compelling storytelling
        7. Can be naturally divided into 4-8 coherent sections/chapters
        
        The story should feel complete yet leave room for visual interpretation
        (as images will be paired with sections of this story).
        
        OUTPUT FORMAT:
        Return ONLY a valid JSON object with the following structure:
        {{
            "story": "Your epic story here...",
            "title_suggestion": "Suggested title for the epic",
            "themes": ["theme1", "theme2", "theme3"]
        }}
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a master storyteller specializing in epic, literary narratives. You output JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model,
                response_format={"type": "json_object"},
                temperature=0.8,  # Higher creativity for epic stories
            )

            response_content = chat_completion.choices[0].message.content
            return json.loads(response_content)

        except Exception as e:
            print(f"Error in epic story generation: {e}")
            return {
                "story": "Error generating epic story.",
                "title_suggestion": "Untitled Epic",
                "themes": []
            }

    def complete_epic_story(self, existing_story: str, continuation_prompt: str, user_commentary: str = "") -> dict:
        """
        Continues/completes an existing epic story.
        
        Args:
            existing_story: The story so far
            continuation_prompt: Direction for how to continue
            user_commentary: Additional user guidance
            
        Returns:
            Dictionary with 'continuation' key containing the new content
        """
        if not self.client:
            return {"continuation": "LLM service is not configured (missing GROQ_API_KEY)."}

        prompt = f"""
        You are continuing an epic story. Here is the story so far:
        
        EXISTING STORY:
        {existing_story[:8000]}
        
        CONTINUATION DIRECTION:
        {continuation_prompt}
        
        USER'S COMMENTARY:
        {user_commentary if user_commentary else "No additional commentary"}
        
        TASK:
        Write a compelling continuation that:
        1. Maintains consistency with the existing story's tone, style, and narrative
        2. Follows the continuation direction provided
        3. Adds substantial new content (800-1500 words)
        4. Advances the plot meaningfully
        5. Can stand as coherent sections when paired with images
        
        OUTPUT FORMAT:
        Return ONLY a valid JSON object:
        {{
            "continuation": "Your continuation text here..."
        }}
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a master storyteller continuing an epic narrative. You output JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model,
                response_format={"type": "json_object"},
                temperature=0.8,
            )

            response_content = chat_completion.choices[0].message.content
            return json.loads(response_content)

        except Exception as e:
            print(f"Error in story completion: {e}")
            return {"continuation": "Error generating story continuation."}



llm_service = LLMService()
