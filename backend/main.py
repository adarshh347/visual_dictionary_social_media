from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from backend.routers import posts
from backend.routers.posts import test_connection
# above syntax to keep in mind
from fastapi.middleware.cors import CORSMiddleware

# ............
from fastapi import FastAPI, HTTPException # Make sure HTTPException is imported
from fastapi.middleware.cors import CORSMiddleware
from .routers import posts
from .database import ping_server, post_collection
from .routers.posts import post_helper
from .schemas.post import PaginatedPosts, Post # <-- Import schemas
from typing import List, Optional # <-- Import List and Optional
import math # <-- Import math
import pprint # <-- Import pprint
# .............




app = FastAPI(title="visual dictionary")

# for security reasons, browsers block requests between multiple addresses
# CORS(cross origin resource sharing) allows both to get connected
origins =[
    "http://localhost:5173"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    await test_connection()

# In backend/main.py

# --- FULL IMPLEMENTATION DIRECTLY ON APP ---
@app.get("/api/v1/posts/with-text", response_model=PaginatedPosts)
async def get_posts_with_text_main(page: int = 1, limit: int = 50):
    query = {
        "text_blocks": {
            "$exists": True,
            "$not": {"$size": 0}
        }
    }

    total_posts = await post_collection.count_documents(query)
    if total_posts == 0:
        return {"posts": [], "total_pages": 0, "current_page": 1}

    skip = (page - 1) * limit
    posts_cursor = post_collection.find(query).sort("updated_at", -1).skip(skip).limit(limit)

    posts_list = []
    async for post in posts_cursor:
        try:
            helper_result = post_helper(post)
            posts_list.append(helper_result)
        except Exception as e:
            print(f"Error processing post {post.get('_id')} in post_helper: {e}")

    total_pages = math.ceil(total_posts / limit)

    response_data = {
        "posts": posts_list,
        "total_pages": total_pages,
        "current_page": page
    }

    # Keep the detailed logging for now, it's helpful
    # ... (print statements) ...

    return response_data

# ... (Keep your @app.on_event("startup") and app.include_router lines) ...
app.include_router(posts.router, prefix="/api/v1/posts", tags=["Posts"])

# app.mount("/static", StaticFiles(directory="static"), name="static")
# All routes in that file will now be available under the "/api/v1/posts" prefix
app.include_router(posts.router, prefix="/api/v1/posts", tags=["Posts"])
# tags=["Posts"]: This groups all the post routes under a "Posts" heading in your automatic API documentation.

app.include_router(posts.text_posts_router, prefix="/api/v1/posts", tags=["Posts Text"]) # Use same prefix