"""
API endpoints for AI-powered phrase generation with learning
"""
from fastapi import APIRouter, HTTPException
from typing import List

from backend.schemas.phrase import (
    PhraseGenerationRequest,
    PhraseGenerationResponse,
    PhraseEnhancement,
    PhraseSaveRequest
)
from backend.services.phrase_service import phrase_service

router = APIRouter(prefix="/api/v1/phrases", tags=["phrases"])


@router.post("/generate", response_model=PhraseGenerationResponse)
async def generate_phrase(request: PhraseGenerationRequest):
    """
    Generate an AI phrase for an image
    
    - **post_id**: ID of the post/image
    - **use_memory**: Whether to use past learnings (default: True)
    - **style**: Style of phrase (erotic, poetic, descriptive)
    """
    try:
        response = await phrase_service.generate_phrase(
            post_id=request.post_id,
            use_memory=request.use_memory,
            style=request.style
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating phrase: {str(e)}")


@router.post("/enhance")
async def save_enhancement(enhancement: PhraseEnhancement):
    """
    Save a user's enhancement to the learning database
    
    This stores the user's improved version of a phrase to learn their preferences
    """
    try:
        learning_id = await phrase_service.save_enhancement(
            original_phrase=enhancement.original_phrase,
            enhanced_phrase=enhancement.enhanced_phrase,
            image_context=enhancement.image_context,
            tags=enhancement.tags
        )
        return {
            "success": True,
            "learning_id": learning_id,
            "message": "Enhancement saved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving enhancement: {str(e)}")


@router.post("/save")
async def save_phrase_to_post(request: PhraseSaveRequest):
    """
    Save the final phrase as a text block in the post
    
    This adds the phrase to the post's text_blocks array
    """
    try:
        success = await phrase_service.save_phrase_to_post(
            post_id=request.post_id,
            phrase=request.phrase,
            block_type=request.block_type,
            color=request.color
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Post not found or update failed")
        
        return {
            "success": True,
            "message": "Phrase saved to post successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving phrase: {str(e)}")


@router.get("/stats")
async def get_learning_stats():
    """
    Get statistics about the learning database
    
    Returns total learnings and most used enhancements
    """
    try:
        stats = await phrase_service.get_learning_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")
