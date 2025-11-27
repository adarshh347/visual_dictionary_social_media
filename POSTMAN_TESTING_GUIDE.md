# Postman Testing Guide for Sharirasutra API

**Base URL:** `https://sharirasutra.onrender.com`

---

## 🔍 Quick Test - Health Check

### GET /health
**URL:** `https://sharirasutra.onrender.com/health`

**Method:** GET

**Headers:** None required

**Body:** None

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "sharirasutra"
}
```

---

## 📝 POSTS ENDPOINTS

### 1. Get All Posts (Paginated)
**URL:** `https://sharirasutra.onrender.com/api/v1/posts`

**Method:** GET

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50) - Items per page
- `tag` (optional) - Filter by tag

**Example URLs:**
```
https://sharirasutra.onrender.com/api/v1/posts
https://sharirasutra.onrender.com/api/v1/posts?page=1&limit=20
https://sharirasutra.onrender.com/api/v1/posts?tag=nature
```

**Expected Response:**
```json
{
  "posts": [
    {
      "id": "post_id_here",
      "photo_url": "https://...",
      "photo_public_id": "posts/uuid",
      "updated_at": "2024-01-01T00:00:00Z",
      "text_blocks": [],
      "bounding_box_tags": {},
      "general_tags": ["tag1", "tag2"]
    }
  ],
  "total_pages": 5,
  "current_page": 1
}
```

---

### 2. Get Posts with Text Blocks
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/with-text`

**Method:** GET

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Example URL:**
```
https://sharirasutra.onrender.com/api/v1/posts/with-text?page=1&limit=20
```

---

### 3. Get Single Post by ID
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/{post_id}`

**Method:** GET

**Example URL:**
```
https://sharirasutra.onrender.com/api/v1/posts/67890abcdef1234567890123
```

**Expected Response:**
```json
{
  "id": "67890abcdef1234567890123",
  "photo_url": "https://...",
  "photo_public_id": "posts/uuid",
  "updated_at": "2024-01-01T00:00:00Z",
  "text_blocks": [
    {
      "id": "block_uuid",
      "type": "paragraph",
      "content": "Some text content",
      "color": null
    }
  ],
  "bounding_box_tags": {},
  "general_tags": ["tag1"]
}
```

---

### 4. Create New Post (Upload Image)
**URL:** `https://sharirasutra.onrender.com/api/v1/posts`

**Method:** POST

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (form-data in Postman):**
- `file` (type: File) - Select an image file
- `general_tags_str` (optional, type: Text) - Comma-separated tags, e.g., "nature,sunset,photography"

**Postman Setup:**
1. Select Body tab → form-data
2. Key: `file`, Type: File → Select an image
3. Key: `general_tags_str`, Type: Text → Value: "nature,landscape" (optional)

**Expected Response (201):**
```json
{
  "id": "new_post_id",
  "photo_url": "https://res.cloudinary.com/...",
  "photo_public_id": "posts/uuid",
  "updated_at": "2024-01-01T00:00:00Z",
  "text_blocks": [],
  "bounding_box_tags": {},
  "general_tags": ["nature", "landscape"]
}
```

---

### 5. Bulk Upload Multiple Images
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/bulk-upload`

**Method:** POST

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (form-data in Postman):**
- `files` (type: File) - Select multiple image files

**Postman Setup:**
1. Select Body tab → form-data
2. Key: `files`, Type: File → Select multiple files (hold Ctrl/Cmd to select multiple)

**Expected Response (201):**
```json
[
  {
    "id": "post_id_1",
    "photo_url": "https://...",
    ...
  },
  {
    "id": "post_id_2",
    "photo_url": "https://...",
    ...
  }
]
```

---

### 6. Update Post
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/{post_id}`

**Method:** PATCH

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "text_blocks": [
    {
      "id": "block_uuid",
      "type": "paragraph",
      "content": "Updated text content",
      "color": "#FF0000"
    }
  ],
  "general_tags": ["updated", "tag1", "tag2"],
  "bounding_box_tags": {
    "tag1": {
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 50
    }
  }
}
```

**Note:** All fields are optional. Only include fields you want to update.

---

### 7. Delete Post
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/{post_id}`

**Method:** DELETE

**Headers:** None required

**Body:** None

**Expected Response:** 204 No Content

---

### 8. Get All Tags
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/tags/`

**Method:** GET

**Expected Response:**
```json
["tag1", "tag2", "tag3", "nature", "landscape"]
```

---

### 9. Get Popular Tags
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/tags/popular`

**Method:** GET

**Query Parameters:**
- `limit` (optional, default: 10) - Number of popular tags to return

**Example URL:**
```
https://sharirasutra.onrender.com/api/v1/posts/tags/popular?limit=5
```

**Expected Response:**
```json
["most_used_tag", "second_most_used", "third_most_used"]
```

---

### 10. Get Highlights
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/highlights`

**Method:** GET

**Expected Response:**
```json
[
  {
    "id": "post_id",
    "photo_url": "https://...",
    "text_blocks": [...],
    "general_tags": [...],
    ...
  }
]
```

---

### 11. Get Random Untagged Posts
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/untagged/random`

**Method:** GET

**Query Parameters:**
- `limit` (optional, default: 5) - Number of random untagged posts

**Example URL:**
```
https://sharirasutra.onrender.com/api/v1/posts/untagged/random?limit=10
```

---

### 12. Add Tag to Post
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/{post_id}/add-tag`

**Method:** PATCH

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "tag": "new_tag_name"
}
```

---

### 13. Add Tag and Story to Post
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/{post_id}/add-tag-and-story`

**Method:** PATCH

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "tag": "story_tag",
  "story": "This is a story about the image. It can be multiple paragraphs long."
}
```

---

## 🤖 LLM/AI ENDPOINTS

### 14. Get Tag Summary
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/summary/{tag}`

**Method:** GET

**Example URL:**
```
https://sharirasutra.onrender.com/api/v1/posts/summary/nature
```

**Expected Response:**
```json
{
  "summary": "Summary of all posts with this tag...",
  "plot_suggestions": [
    "Plot idea 1",
    "Plot idea 2",
    "Plot idea 3",
    "Plot idea 4",
    "Plot idea 5"
  ]
}
```

---

### 15. Generate Story from Tag
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/summary/generate_story`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "tag": "nature",
  "plot_suggestion": "A magical forest adventure",
  "user_commentary": "Make it mysterious and exciting"
}
```

**Expected Response:**
```json
{
  "story": "Long generated story text here..."
}
```

---

### 16. Generate Story Flow
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/summary/generate_story_flow`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "story": "Your long story text here...",
  "detail_level": "med"
}
```

**Detail Levels:**
- `"small"` - 3-5 events
- `"med"` - 5-10 events (default)
- `"big"` - 10-15 events

**Expected Response:**
```json
{
  "flow": "event1->event2->event3->event4->event5"
}
```

---

### 17. Generate Post Suggestion
**URL:** `https://sharirasutra.onrender.com/api/v1/posts/suggestions/generate`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "text_blocks": [
    {
      "id": "block_1",
      "type": "paragraph",
      "content": "Existing text content",
      "color": null
    }
  ],
  "suggestion_type": "short_prose",
  "user_commentary": "Make it more dramatic"
}
```

**Suggestion Types:**
- `"short_prose"` - 2-3 paragraphs
- `"story"` - 4-6 paragraphs

**Expected Response:**
```json
{
  "suggestion": "Generated prose or story text here..."
}
```

---

## 🧪 Testing Tips

1. **Start with Health Check** - Verify the service is running
2. **Create a Post** - Upload an image to get a post_id
3. **Use the post_id** - Save it for testing other endpoints
4. **Test Tags** - Add tags and use them for filtering
5. **Test LLM Endpoints** - Requires GROQ_API_KEY to be set in environment

---

## 📚 API Documentation

FastAPI automatically generates interactive API docs:
- **Swagger UI:** `https://sharirasutra.onrender.com/docs`
- **ReDoc:** `https://sharirasutra.onrender.com/redoc`

Visit these URLs in your browser to see all available endpoints with schemas and try them out directly!

---

## 🚨 Common Issues

1. **CORS Errors:** Make sure you're using the correct origin
2. **File Upload:** Use `form-data` not `raw` or `x-www-form-urlencoded`
3. **Post ID:** Must be a valid MongoDB ObjectId (24 hex characters)
4. **LLM Endpoints:** Require GROQ_API_KEY to be configured

