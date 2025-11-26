# BaseModel is the foundational Pydantic class that all pydantic schemas inherit from
from pydantic import BaseModel, Field
from typing import Optional,Dict, List
from datetime import datetime
import uuid

# a schema for bounding box coordinates
class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int

class TextBlock(BaseModel):
    id: str = Field(default_factory=lambda: f"block_{uuid.uuid4()}")
    type: str  # e.g., 'h1', 'paragraph', 'quote'
    content: str
    color: Optional[str] = None


# main schema for post object, used for response
class Post(BaseModel):
    id: str
    photo_url: str
    photo_public_id: str
    updated_at: Optional[datetime] = None
    text_blocks:List[TextBlock] = []
    bounding_box_tags : Optional[dict[str, BoundingBox]] = None
    general_tags : Optional[List[str]] = None


# note in PostUpdate: by default providing new data in update request will override the old data not get merged with it
# merging is custom behavior that we must define in our backend logic
# the schema's job is to validate the shape of incoming data, not to decide how it should be combined with existing data
# Lesson: MERGING LOGIC SHOULD BE WRITTEN IN ROUTER SECTION WHEN CREATING ENDPOINTS

class PostUpdate(BaseModel):
    text_blocks: Optional[List[TextBlock]] = None
    bounding_box_tags: Optional[dict[str, BoundingBox]] = None
    general_tags: Optional[List[str]] = None


# a new introduced schema

class PaginatedPosts(BaseModel):
    posts: List[Post]
    total_pages: int
    current_page: int