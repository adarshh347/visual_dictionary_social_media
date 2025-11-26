import motor.motor_asyncio
import ssl
# pymongo(synchronous) and motor(asynchronous) both are python libraries that are used to interact with mongodb database
# the node framework equivalent is mongoose
from backend.config import settings

# --- MongoDB Connection Setup with SSL/TLS configuration ---
# For MongoDB Atlas on Windows, we need explicit TLS configuration
# This fixes the "TLSV1_ALERT_INTERNAL_ERROR" SSL handshake issue
try:
    # Create SSL context for MongoDB Atlas
    # Note: tlsAllowInvalidCertificates=True is for development only
    # In production, ensure proper certificate validation
    ssl_context = ssl.create_default_context()
    # For development: allow invalid certificates (Windows SSL compatibility)
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGO_DETAILS,
        tls=True,
        tlsAllowInvalidCertificates=True,  # Development only - fixes Windows SSL issues
        serverSelectionTimeoutMS=30000,  # 30 seconds timeout for server selection
        socketTimeoutMS=30000,  # 30 seconds socket timeout
        connectTimeoutMS=30000,  # 30 seconds connection timeout
        retryWrites=True,
        retryReads=True,
        maxPoolSize=50,
        minPoolSize=10
    )
except Exception as e:
    print(f"Error creating MongoDB client: {e}")
    raise

# theory imp: clusters and database are different
database = client.visualDictionaryDB
post_collection = database.get_collection("posts")

# --- Connection Test Function ---
async def ping_server():
    """Checks if the MongoDB server is responsive."""
    try:
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        return True
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB. Error: {e}")
        return False
        # Optionally, you could raise an exception here to stop the app
        # raise RuntimeError(f"Could not connect to MongoDB: {e}")