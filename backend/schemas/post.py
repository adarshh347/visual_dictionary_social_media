# BaseModel is the foundational Pydantic class that all pydantic schemas inherit from
from pydantic import BaseModel
from typing import Optional,Dict, List

# a schema for bounding box coordinates
class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int

# main schema for post object, used for response
class Post(BaseModel):
    id: str
    photo_url: str
    description: Optional[str] = None
    bounding_box_tags : Optional[dict[str, BoundingBox]] = None
    general_tags : Optional[List[str]] = None


# note in PostUpdate: by default providing new data in update request will override the old data not get merged with it
# merging is custom behavior that we must define in our backend logic
# the schema's job is to validate the shape of incoming data, not to decide how it should be combined with existing data
# Lesson: MERGING LOGIC SHOULD BE WRITTEN IN ROUTER SECTION WHEN CREATING ENDPOINTS

class PostUpdate(BaseModel):
    description: Optional[str] = None
    bounding_box_tags: Optional[dict[str, BoundingBox]] = None
    general_tags: Optional[List[str]] = None