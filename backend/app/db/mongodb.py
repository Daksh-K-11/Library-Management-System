from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGO_URI, DB_NAME

client = AsyncIOMotorClient(
    MONGO_URI,
    maxPoolSize=10,
    serverSelectionTimeoutMS=5000
)

db = client[DB_NAME]
books_collection = db.books
users_collection = db.users
user_books_collection = db.user_books
libraries_collection = db.libraries
library_books_collection = db.library_books