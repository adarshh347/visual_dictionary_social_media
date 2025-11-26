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

    def generate_story_flow(self, story: str) -> dict:
        """
        Generates a summarized flow of the story in phrases/keywords (ev1->ev2->ev3 format).
        """
        if not self.client:
            return {"flow": "LLM service is not configured (missing GROQ_API_KEY)."}

        prompt = f"""
        You are a story analyzer. Analyze the following story and break it down into a sequential flow of key events/phrases.

        STORY:
        {story[:8000]}

        TASK:
        Break down the story into 5-10 key events or phrases that represent the story's progression.
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

llm_service = LLMService()
