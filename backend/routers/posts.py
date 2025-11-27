from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from typing import Dict, Optional, List
import uuid
import os
import math
import json
import random
from datetime import datetime, timezone
from bson.objectid  import ObjectId
from bson.errors import InvalidId
# shutil(high level file operations) vs os (low level file operations)
import shutil
from backend.schemas.post import Post, PostUpdate, PaginatedPosts, StoryGenerationRequest, AddTagRequest, AddTagAndStoryRequest, StoryFlowRequest, PostSuggestionRequest

from backend.database import post_collection,client
import cloudinary
import cloudinary.uploader
from backend.config import settings
# ... shows three directory below from the main directory(big_project)
import asyncio
import pprint # Make sure pprint is imported for the detailed log
# fake in memory database
# fake_posts_db: Dict[str, Dict] ={}

cloudinary.config(
    cloud_name=settings.CLOUDINARY_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

async def test_connection():
    try:
        await client.admin.command('ping')
        print(f"mongodb connection working ")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")



router= APIRouter()
text_posts_router = APIRouter()
# router= APIRouter() creates a mini subapplication (a collection of endpoints)

# NOTE(TO LEARN): since we are uploading pictures(file type)
# they don't come as normal api request which can be parsed as json and mapped to pydantic model
# they are parsed as FORM-FIELDS+FILE STREAMS (multipart/form-data)
# That format is literally a set of parts—some parts are text fields, some are files.
# therefore we cannot directly inherit from schema here
# @router.get("/")
# def random():
#     return {"check":"great work"}


# mongodb and pydantic schemas are not compatible, so we need to create post_helper

def post_helper(post) -> dict:
    return {
        "id": str(post["_id"]),
        "photo_url": post.get("photo_url"),
        "photo_public_id": post.get("photo_public_id"),
        "updated_at": post.get("updated_at"),  # Use .get() for the timestamp
        "text_blocks": post.get("text_blocks", []), # Fallback to an empty list
        "bounding_box_tags": post.get("bounding_box_tags", {}), # Fallback to an empty dict
        "general_tags": post.get("general_tags", []), # Fallback to an empty list
    }





# --- CORRECTED Create Endpoint ---
@router.post("/", response_model=Post, status_code=201)
async def create_post(
    file: UploadFile = File(...),
    general_tags_str: Optional[str] = Form(None)
):
    public_id = f"posts/{uuid.uuid4()}"
    upload_result = cloudinary.uploader.upload(file.file, public_id=public_id)

    # Corrected to match the new schema
    post_document = {
        "photo_url": upload_result["secure_url"],
        "photo_public_id": upload_result["public_id"],
        "updated_at": datetime.now(timezone.utc),
        "text_blocks": [], # Initialize as empty list
        "bounding_box_tags": {}, # Initialize as empty dict
        "general_tags": general_tags_str.split(',') if general_tags_str else []
    }

    new_post = await post_collection.insert_one(post_document)
    created_post = await post_collection.find_one({"_id": new_post.inserted_id})
    return post_helper(created_post)

# below part commented out

@router.post("/bulk-upload", response_model=List[Post], status_code=201)
async def create_multiple_posts(files: List[UploadFile] = File(...)):
    created_posts_docs = []
    for file in files:
        public_id = f"posts/{uuid.uuid4()}"
        upload_result = cloudinary.uploader.upload(file.file, public_id=public_id)

        # Corrected to match the new schema
        post_document = {
            "photo_url": upload_result["secure_url"],
            "photo_public_id": upload_result["public_id"],
            "updated_at": datetime.now(timezone.utc),
            "text_blocks": [],
            "bounding_box_tags": {},
            "general_tags": []
        }
        created_posts_docs.append(post_document)

    result = await post_collection.insert_many(created_posts_docs)

    # Fetch all newly created documents to return them
    created_posts = []
    async for post in post_collection.find({"_id": {"$in": result.inserted_ids}}):
        created_posts.append(post_helper(post))

    return created_posts

@router.get("/abc")
async def get_posts_with_text():
    print("--- DEBUG: Inside /with-text endpoint! ---") # Add a print right at the start
    return {"message": "Test successful"} # Simplest possible return

@router.get("/{post_id}", response_model=Post)
async def get_post_by_id(post_id: str):
    try:
        # Try to convert the string to an ObjectId
        obj_id = ObjectId(post_id)
    except InvalidId:
        # If it fails, raise a 400 error for bad input
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    post = await post_collection.find_one({"_id": obj_id})

    if post:
        return post_helper(post)

    raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")

# More general route comes after
@router.get("/", response_model=PaginatedPosts)
async def get_all_posts(page: int = 1, limit: int = 50, tag: Optional[str] = None):
    query = {}
    if tag:
        # Corrected field name (no space)
        query["general_tags"] = tag

    # Corrected to use the query in count_documents
    total_posts = await post_collection.count_documents(query)
    if total_posts == 0:
        return {"posts": [], "total_pages": 0, "current_page": 1}

    skip = (page - 1) * limit
    posts_cursor = post_collection.find(query).sort("_id", -1).skip(skip).limit(limit)

    posts = []
    async for post in posts_cursor:
        posts.append(post_helper(post))

    total_pages = math.ceil(total_posts / limit)
    return {
        "posts": posts,
        "total_pages": total_pages,
        "current_page": page
    }

@router.patch("/{post_id}", response_model=Post)
async def update_post(post_id: str, post_data: PostUpdate):
    update_data = post_data.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    # CRUCIAL: Always update the 'updated_at' timestamp on any edit
    update_data["updated_at"] = datetime.now(timezone.utc)

    try:
        obj_id = ObjectId(post_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    result = await post_collection.update_one({"_id": obj_id}, {"$set": update_data})

    if result.modified_count == 1:
        if (updated_post := await post_collection.find_one({"_id": obj_id})) is not None:
            return post_helper(updated_post)

    raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")
# --- Refactored DELETE Endpoint ---
@router.delete("/{post_id}", status_code=204)
async def delete_post(post_id: str):
    # First, retrieve the post to get the photo_url for file deletion
    post_to_delete = await post_collection.find_one({"_id": ObjectId(post_id)})
    if not post_to_delete:
        raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")

    cloudinary.uploader.destroy(post_to_delete["photo_public_id"])

    # Delete the post from the database
    await post_collection.delete_one({"_id": ObjectId(post_id)})
    return



@router.get("/tags/", response_model=List[str])
async def get_all_unique_tags():
    tags = await post_collection.distinct("general_tags")
    return tags

@router.get("/tags/popular", response_model=List[str])
async def get_popular_tags(limit: int = 10):
    """
    Returns the most popular tags (tags that appear in the most posts).
    """
    # Aggregate to count tag occurrences
    pipeline = [
        {"$unwind": "$general_tags"},  # Flatten the tags array
        {"$group": {"_id": "$general_tags", "count": {"$sum": 1}}},  # Count occurrences
        {"$sort": {"count": -1}},  # Sort by count descending
        {"$limit": limit},  # Limit to top N tags
        {"$project": {"_id": 0, "tag": "$_id"}}  # Rename _id to tag
    ]
    
    popular_tags = []
    async for doc in post_collection.aggregate(pipeline):
        if doc.get("tag"):
            popular_tags.append(doc["tag"])
    
    return popular_tags


@router.get("/highlights", response_model=List[Post])
async def get_highlights():
    """
    Fetches the 20 most recently updated posts that have textual content
    (either text blocks or general tags).
    """
    # This query finds documents where EITHER text_blocks OR general_tags is not empty
    query = {
        "$or": [
            {"text_blocks": {"$ne": []}},
            {"general_tags": {"$ne": []}}
        ]
    }

    posts_cursor = post_collection.find(query).sort("updated_at", -1).limit(20)

    highlights = []
    async for post in posts_cursor:
        highlights.append(post_helper(post))

    return highlights


# In backend/routers/posts.py

# In backend/routers/posts.py



from backend.services.llm_service import llm_service

@router.get("/summary/{tag}")
async def get_tag_summary(tag: str):
    """
    Aggregates text from all posts with the given tag and generates a summary and plot suggestions using LLM.
    """
    # Find all posts that have the specified tag in their general_tags list
    query = {"general_tags": tag}
    posts_cursor = post_collection.find(query)
    
    aggregated_text = []
    
    async for post in posts_cursor:
        # Extract text from text_blocks
        if "text_blocks" in post:
            for block in post["text_blocks"]:
                if "content" in block and block["content"]:
                    aggregated_text.append(block["content"])
                    
    full_text = "\n\n".join(aggregated_text)
    
    # Generate summary and plots
    result = llm_service.generate_summary_and_plots(full_text)
    
    return result

@router.post("/summary/generate_story")
async def generate_story(request: StoryGenerationRequest):
    """
    Generates a long story based on the aggregated text of a tag, a plot suggestion, and user commentary.
    """
    # Find all posts that have the specified tag in their general_tags list
    query = {"general_tags": request.tag}
    posts_cursor = post_collection.find(query)
    
    aggregated_text = []
    
    async for post in posts_cursor:
        # Extract text from text_blocks
        if "text_blocks" in post:
            for block in post["text_blocks"]:
                if "content" in block and block["content"]:
                    aggregated_text.append(block["content"])
                    
    full_text = "\n\n".join(aggregated_text)
    
    # Generate story
    result = llm_service.generate_story_from_plot(
        aggregated_text=full_text,
        plot_suggestion=request.plot_suggestion,
        user_commentary=request.user_commentary
    )
    
    return result

@router.get("/untagged/random", response_model=List[Post])
async def get_random_untagged_posts(limit: int = 5):
    """
    Fetches random posts that have no general_tags or empty general_tags.
    """
    # Query for posts with no general_tags or empty general_tags
    query = {
        "$or": [
            {"general_tags": {"$exists": False}},
            {"general_tags": []},
            {"general_tags": {"$eq": None}}
        ]
    }
    
    # Get all matching posts
    posts_cursor = post_collection.find(query)
    all_posts = []
    async for post in posts_cursor:
        all_posts.append(post_helper(post))
    
    # Randomly select up to 'limit' posts
    if len(all_posts) <= limit:
        return all_posts
    else:
        return random.sample(all_posts, limit)

@router.patch("/{post_id}/add-tag", response_model=Post)
async def add_tag_to_post(post_id: str, request: AddTagRequest):
    """
    Adds a tag to a post's general_tags list. If the tag already exists, does nothing.
    """
    try:
        obj_id = ObjectId(post_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
    
    # Get the current post
    post = await post_collection.find_one({"_id": obj_id})
    if not post:
        raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")
    
    # Get current tags or initialize empty list
    current_tags = post.get("general_tags", []) or []
    
    # Add tag if it doesn't exist
    if request.tag not in current_tags:
        current_tags.append(request.tag)
    
    # Update the post
    update_data = {
        "general_tags": current_tags,
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await post_collection.update_one(
        {"_id": obj_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 1 or result.matched_count == 1:
        updated_post = await post_collection.find_one({"_id": obj_id})
        return post_helper(updated_post)
    
    raise HTTPException(status_code=500, detail="Failed to update post")

@router.patch("/{post_id}/add-tag-and-story", response_model=Post)
async def add_tag_and_story_to_post(post_id: str, request: AddTagAndStoryRequest):
    """
    Adds a tag to a post's general_tags list AND adds the story as a text block.
    If the tag already exists, it still adds the story.
    """
    try:
        obj_id = ObjectId(post_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
    
    # Get the current post
    post = await post_collection.find_one({"_id": obj_id})
    if not post:
        raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")
    
    # Get current tags or initialize empty list
    current_tags = post.get("general_tags", []) or []
    
    # Add tag if it doesn't exist
    if request.tag not in current_tags:
        current_tags.append(request.tag)
    
    # Get current text blocks or initialize empty list
    current_text_blocks = post.get("text_blocks", []) or []
    
    # Create a new text block for the story
    # Use 'paragraph' type for the story, or you could use a custom type like 'story'
    new_story_block = {
        "id": f"block_{uuid.uuid4()}",
        "type": "paragraph",
        "content": request.story,
        "color": None
    }
    
    # Add the story block to the text blocks
    current_text_blocks.append(new_story_block)
    
    # Update the post with both tag and story
    update_data = {
        "general_tags": current_tags,
        "text_blocks": current_text_blocks,
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await post_collection.update_one(
        {"_id": obj_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 1 or result.matched_count == 1:
        updated_post = await post_collection.find_one({"_id": obj_id})
        return post_helper(updated_post)
    
    raise HTTPException(status_code=500, detail="Failed to update post")

@router.post("/summary/generate_story_flow")
async def generate_story_flow(request: StoryFlowRequest):
    """
    Generates a summarized flow of the story in phrases/keywords (ev1->ev2->ev3 format).
    detail_level: "small" (3-5 events), "med" (5-10 events), "big" (10-15 events)
    """
    result = llm_service.generate_story_flow(request.story, request.detail_level)
    return result

@router.post("/suggestions/generate")
async def generate_post_suggestion(request: PostSuggestionRequest):
    """
    Generates suggestions (short prose or story) based on existing text blocks.
    """
    # Convert Pydantic models to dict for LLM service
    text_blocks_dict = [block.dict() for block in request.text_blocks]
    result = llm_service.generate_post_suggestion(
        text_blocks=text_blocks_dict,
        suggestion_type=request.suggestion_type,
        user_commentary=request.user_commentary or ""
    )
    return result
