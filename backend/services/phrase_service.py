"""
Phrase generation service with AI learning capabilities
Uses vision AI for direct image-to-phrase generation
"""
import os
from typing import List, Optional, Tuple
from datetime import datetime, timezone
from bson import ObjectId

from backend.database import phrase_learning_collection, post_collection
from backend.schemas.phrase import (
    PhraseEnhancement, 
    PhraseLearning, 
    PhraseGenerationResponse
)
from backend.services.vision_service import VisionService


class PhraseService:
    """Service for generating and learning from phrase enhancements"""
    
    def __init__(self):
        self.vision_service = VisionService()
        # Simple embedding using sentence similarity (can upgrade to sentence-transformers)
        self.use_embeddings = False  # Start simple, can enable later
        
    async def generate_phrase(
        self, 
        post_id: str, 
        use_memory: bool = True,
        style: str = "erotic"
    ) -> PhraseGenerationResponse:
        """
        Generate a phrase for an image, optionally using past learnings
        
        Args:
            post_id: ID of the post/image
            use_memory: Whether to incorporate user's past enhancements
            style: Style of phrase (erotic, poetic, etc.)
            
        Returns:
            PhraseGenerationResponse with generated phrase and metadata
        """
        try:
            print(f"🔍 [PHRASE] Starting phrase generation for post_id: {post_id}")
            
            # 1. Get the post/image
            print(f"📥 [PHRASE] Fetching post from database...")
            post = await post_collection.find_one({"_id": ObjectId(post_id)})
            if not post:
                print(f"❌ [PHRASE] Post {post_id} not found in database")
                raise ValueError(f"Post {post_id} not found")
            
            print(f"✅ [PHRASE] Post found: {post.get('_id')}")
            image_url = post.get("photo_url")
            tags = post.get("general_tags", [])
            print(f"🖼️  [PHRASE] Image URL: {image_url}")
            print(f"🏷️  [PHRASE] Tags: {tags}")
            
            # 2. If memory enabled, get relevant past learnings for context
            learning_context = ""
            similar_learnings = []
            used_learning = False
            
            if use_memory:
                print(f"🧠 [PHRASE] Memory enabled, fetching learnings...")
                try:
                    learnings = await self._get_relevant_learnings(tags, "")
                    if learnings:
                        used_learning = True
                        similar_learnings = [str(l["_id"]) for l in learnings[:3]]
                        learning_context = self._build_learning_context(learnings)
                        print(f"✅ [PHRASE] Found {len(learnings)} relevant learnings")
                    else:
                        print(f"ℹ️  [PHRASE] No relevant learnings found")
                except Exception as e:
                    print(f"⚠️  [PHRASE] Error fetching learnings: {e}, continuing without memory")
            else:
                print(f"ℹ️  [PHRASE] Memory disabled")
            
            # 3. Generate phrase directly from image using Vision AI
            print(f"👁️  [PHRASE] Generating phrase with Vision AI (style: {style})...")
            phrase = await self._generate_phrase_from_image(
                image_url=image_url,
                learning_context=learning_context,
                style=style,
                tags=tags
            )
            print(f"✅ [PHRASE] Phrase generated: {phrase}")
            
            response = PhraseGenerationResponse(
                phrase=phrase,
                used_learning=used_learning,
                similar_learnings=similar_learnings
            )
            print(f"🎉 [PHRASE] Generation complete!")
            return response
            
        except Exception as e:
            print(f"❌ [PHRASE] CRITICAL ERROR in generate_phrase: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    async def save_enhancement(
        self,
        original_phrase: str,
        enhanced_phrase: str,
        image_context: str,
        tags: List[str]
    ) -> str:
        """
        Save a user's enhancement to the learning database
        
        Returns:
            ID of the saved learning entry
        """
        enhancement = PhraseEnhancement(
            original_phrase=original_phrase,
            enhanced_phrase=enhanced_phrase,
            image_context=image_context,
            tags=tags
        )
        
        learning = PhraseLearning(
            enhancement=enhancement,
            user_id="default"
        )
        
        # Generate embedding if enabled
        if self.use_embeddings:
            learning.embedding = await self._generate_embedding(enhanced_phrase)
        
        # Save to database
        learning_dict = learning.dict(exclude={"id"})
        result = await phrase_learning_collection.insert_one(learning_dict)
        
        return str(result.inserted_id)
    
    async def save_phrase_to_post(
        self,
        post_id: str,
        phrase: str,
        block_type: str = "paragraph",
        color: str = "#2a2a2a"
    ) -> bool:
        """
        Save the final phrase as a text block in the post
        """
        text_block = {
            "id": f"block_{int(datetime.now(timezone.utc).timestamp() * 1000)}",
            "type": block_type,
            "content": phrase,
            "color": color
        }
        
        result = await post_collection.update_one(
            {"_id": ObjectId(post_id)},
            {
                "$push": {"text_blocks": text_block},
                "$set": {"updated_at": datetime.now(timezone.utc)}
            }
        )
        
        return result.modified_count > 0
    
    async def _get_relevant_learnings(
        self,
        tags: List[str],
        description: str,
        limit: int = 5
    ) -> List[dict]:
        """
        Retrieve relevant past learnings based on tags and description
        
        For now, uses tag matching. Can be upgraded to vector similarity.
        """
        if not tags:
            # If no tags, get most recent learnings
            cursor = phrase_learning_collection.find().sort("created_at", -1).limit(limit)
            return await cursor.to_list(length=limit)
        
        # Find learnings with overlapping tags
        cursor = phrase_learning_collection.find(
            {"enhancement.tags": {"$in": tags}}
        ).sort("usage_count", -1).limit(limit)
        
        learnings = await cursor.to_list(length=limit)
        
        # Increment usage count for retrieved learnings
        for learning in learnings:
            await phrase_learning_collection.update_one(
                {"_id": learning["_id"]},
                {"$inc": {"usage_count": 1}}
            )
        
        return learnings
    
    def _build_learning_context(self, learnings: List[dict]) -> str:
        """
        Build a context string from past learnings to guide the LLM
        """
        if not learnings:
            return ""
        
        examples = []
        for learning in learnings[:3]:  # Use top 3
            enh = learning["enhancement"]
            examples.append(
                f"Original: {enh['original_phrase']}\n"
                f"Enhanced: {enh['enhanced_phrase']}"
            )
        
        context = (
            "Based on your past preferences, here are similar enhancements you've made:\n\n"
            + "\n\n".join(examples) +
            "\n\nUse these as inspiration for your style and preferences."
        )
        
        return context
    
    async def _generate_phrase_from_image(
        self,
        image_url: str,
        learning_context: str,
        style: str,
        tags: List[str]
    ) -> str:
        """
        Generate phrase directly from image using Vision AI
        This is more efficient than vision→description→LLM chain
        """
        try:
            print(f"👁️  [VISION] Starting vision-based phrase generation...")
            
            style_instructions = {
                "erotic": "Create a sensual, evocative phrase (1-2 sentences) that captures the erotic essence and mood",
                "poetic": "Create a poetic, artistic phrase (1-2 sentences) with metaphorical language",
                "descriptive": "Create a detailed, vivid descriptive phrase (1-2 sentences)"
            }
            
            style_instruction = style_instructions.get(style, style_instructions["erotic"])
            tags_str = ", ".join(tags) if tags else "none"
            
            print(f"📝 [VISION] Style: {style}, Tags: {tags_str}")
            
            # Build prompt for vision AI
            prompt = f"""Analyze this image and {style_instruction}.

Tags: {tags_str}

{learning_context}

Requirements:
- Maximum 1-2 sentences
- Evocative and suggestive
- Capture the mood and aesthetic  
- Use rich, sensory language
- Focus on what you SEE in the image

Generate ONLY the phrase, no additional text:"""

            print(f"📤 [VISION] Sending to Vision AI...")
            phrase = await self.vision_service.analyze_image(image_url, prompt)
            
            if not phrase:
                print(f"⚠️  [VISION] Vision AI returned None, using fallback")
                phrase = "A captivating moment captured in time."
            else:
                print(f"✅ [VISION] Phrase received: {phrase[:100]}...")
            
            return phrase.strip()
            
        except Exception as e:
            print(f"❌ [VISION] Error in _generate_phrase_from_image: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    async def _generate_embedding(self, text: str) -> List[float]:
        """
        Generate vector embedding for semantic similarity
        (Placeholder - can integrate sentence-transformers later)
        """
        # Simple hash-based embedding for now
        # In production, use: sentence-transformers, OpenAI embeddings, etc.
        import hashlib
        hash_obj = hashlib.sha256(text.encode())
        hash_bytes = hash_obj.digest()
        # Convert to normalized vector
        embedding = [float(b) / 255.0 for b in hash_bytes[:128]]
        return embedding
    
    async def get_learning_stats(self) -> dict:
        """Get statistics about the learning database"""
        total = await phrase_learning_collection.count_documents({})
        
        # Get most used learnings
        top_learnings = await phrase_learning_collection.find().sort(
            "usage_count", -1
        ).limit(5).to_list(length=5)
        
        return {
            "total_learnings": total,
            "top_learnings": [
                {
                    "enhanced_phrase": l["enhancement"]["enhanced_phrase"],
                    "usage_count": l["usage_count"]
                }
                for l in top_learnings
            ]
        }


# Singleton instance
phrase_service = PhraseService()
