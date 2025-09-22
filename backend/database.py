import motor.motor_asyncio
# pymongo(synchronous) and motor(asynchronous) both are python libraries that are used to interact with mongodb database
# the node framework equivalent is mongoose
from backend.config import settings


client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_DETAILS)

# theory imp: clusters and database are different
database= client.visualDictionaryDB
post_collection=database.get_collection("posts")