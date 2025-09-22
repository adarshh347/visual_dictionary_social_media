from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from backend.routers import posts
from backend.routers.posts import test_connection
# above syntax to keep in mind

app = FastAPI(title="visual dictionary")
@app.on_event("startup")
async def startup_event():
    await test_connection()

# @app.get("/")
# def random():
#     return {"check":"lolohoneysingh"}

app.mount("/static", StaticFiles(directory="static"), name="static")
# All routes in that file will now be available under the "/api/v1/posts" prefix
app.include_router(posts.router, prefix="/api/v1/posts", tags=["Posts"])
# tags=["Posts"]: This groups all the post routes under a "Posts" heading in your automatic API documentation.

