"""
Pydantic schemas for phrase learning and generation
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PhraseEnhancement(BaseModel):
    """User's enhancement to a generated phrase"""
    original_phrase: str
    enhanced_phrase: str
    image_context: str  # Brief description of what the image shows
    tags: List[str] = []  # Tags associated with the image
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    

class PhraseLearning(BaseModel):
    """Stored learning data with embeddings"""
    id: Optional[str] = None
    user_id: str = "default"  # For future multi-user support
    enhancement: PhraseEnhancement
    embedding: Optional[List[float]] = None  # Vector embedding of enhanced phrase
    usage_count: int = 0  # How many times this learning was applied
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PhraseGenerationRequest(BaseModel):
    """Request to generate a phrase for an image"""
    post_id: str
    use_memory: bool = True  # Whether to use learning data
    style: str = "erotic"  # erotic, poetic, descriptive, etc.


class PhraseGenerationResponse(BaseModel):
    """Generated phrase response"""
    phrase: str
    confidence: float = 1.0
    used_learning: bool = False
    similar_learnings: List[str] = []  # IDs of similar past enhancements


class PhraseSaveRequest(BaseModel):
    """Request to save phrase as text block"""
    post_id: str
    phrase: str
    block_type: str = "paragraph"
    color: str = "#2a2a2a"
