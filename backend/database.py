import motor.motor_asyncio
# pymongo(synchronous) and motor(asynchronous) both are python libraries that are used to interact with mongodb database
# the node framework equivalent is mongoose
from backend.config import settings


client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_DETAILS)

# theory imp: clusters and database are different
database= client.visualDictionaryDB
post_collection=database.get_collection("posts")

# backend/database.py
import motor.motor_asyncio
from backend.config import settings # Ensure this import is correct

# --- MongoDB Connection Setup ---
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_DETAILS)
database = client.visualDictionaryDB
post_collection = database.get_collection("posts")

# --- ADD THIS FUNCTION BACK ---
async def ping_server():
    """Checks if the MongoDB server is responsive."""
    try:
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB. Error: {e}")
        # Optionally, you could raise an exception here to stop the app
        # raise RuntimeError(f"Could not connect to MongoDB: {e}")
# -----------------------------