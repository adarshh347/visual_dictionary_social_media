from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from typing import Dict, Optional, List
import uuid
import os
import json
from bson.objectid  import ObjectId
# shutil(high level file operations) vs os (low level file operations)
import shutil
from backend.schemas.post import Post, PostUpdate
from backend.database import post_collection,client
# ... shows three directory below from the main directory(big_project)
import asyncio

# fake in memory database
# fake_posts_db: Dict[str, Dict] ={}

async def test_connection():
    try:
        await client.admin.command('ping')
        print(f"mongodb connection working ")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")



router= APIRouter()
# router= APIRouter() creates a mini subapplication (a collection of endpoints)

# NOTE(TO LEARN): since we are uploading pictures(file type)
# they don't come as normal api request which can be parsed as json and mapped to pydantic model
# they are parsed as FORM-FIELDS+FILE STREAMS (multipart/form-data)
# That format is literally a set of parts—some parts are text fields, some are files.
# therefore we cannot directly inherit from schema here
# @router.get("/")
# def random():
#     return {"check":"greatwork"}


# mongodb and pydantic schemas are not compatible, so we need to create post_helper

def post_helper(post)->dict:
    return {
        "id": str(post["_id"]),
        "photo_url": post["photo_url"],
        "description": post["description"],
        "bounding_box_tags": post["bounding_box_tags"],
        "general_tags": post["general_tags"],
    }






@router.post("/", response_model=Post, status_code=201)
async def create_post(file: UploadFile = File(...),description: Optional[str] = Form(None),
    general_tags_str: Optional[str] = Form(None), # Sent as a comma-separated string
    bounding_box_tags_str: Optional[str] = Form(None)):

    file_path = f"static/images/{uuid.uuid4()}_{file.filename}"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path,"wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    photo_url = f"/{file_path}"

    post_document = {
        "photo_url": photo_url,
        "description": description,
    # For complex data like a dictionary, the client must send a JSON string.
    # e.g., '{"sun": {"x": 50, "y": 50, "width": 80, "height": 80}}'
        "bounding_box_tags": json.loads(bounding_box_tags_str) if bounding_box_tags_str else {},
    # process the optional form data from string into correct types
        "general_tags": general_tags_str.split(',') if general_tags_str else []
    }

    new_post = await post_collection.insert_one(post_document)
    created_post = await post_collection.find_one({"_id": new_post.inserted_id})
    return post_helper(created_post)

# below part commented out

@router.post("/bulk-upload", response_model=List[Post], status_code=201)
async def create_multiple_posts(files: List[UploadFile]=File(...)):
    created_posts=[]
    for file in files:
        file_path = f"static/images/{uuid.uuid4()}_{file.filename}"
#       ensure that the directory exists
        os.makedirs(os.path.dirname(file_path),exist_ok=True)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        photo_url = f"{file_path}"
        post_document  = {
            "photo_url": photo_url,
            "description": None,
            "bounding_box_tags": {},
            "general_tags": []
        }
        new_post_result = await post_collection.insert_one(post_document)
        created_post=await post_collection.find_one({"_id":new_post_result.inserted_id})
        created_posts.append(post_helper(created_post))
    return created_posts
#
#
@router.get("/{post_id}", response_model=Post)
async def get_post_by_id(post_id: str):
    post = await post_collection.find_one({"_id":ObjectId(post_id)})
    if post:
        return post_helper(post)
    raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")

# More general route comes after
@router.get("/", response_model=List[Post])
async def get_all_posts():
    posts=[]
    async for post in post_collection.find():
        posts.append(post_helper(post))
    return posts


@router.patch("/{post_id}", response_model=Post)
async def update_post(post_id: str, post_data: PostUpdate):
    update_data = post_data.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    result = await post_collection.update_one({"_id": ObjectId(post_id)}, {"$set": update_data})

    if result.modified_count == 1:
        if (updated_post := await post_collection.find_one({"_id": ObjectId(post_id)})) is not None:
            return post_helper(updated_post)

    raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")

# --- Refactored DELETE Endpoint ---
@router.delete("/{post_id}", status_code=204)
async def delete_post(post_id: str):
    # First, retrieve the post to get the photo_url for file deletion
    post_to_delete = await post_collection.find_one({"_id": ObjectId(post_id)})
    if not post_to_delete:
        raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")

    # Delete the image file
    photo_path = post_to_delete["photo_url"].lstrip('/')
    if os.path.exists(photo_path):
        os.remove(photo_path)

    # Delete the post from the database
    await post_collection.delete_one({"_id": ObjectId(post_id)})
    return
#


# cba80cb0-9029-4521-8525-21c8120f2627