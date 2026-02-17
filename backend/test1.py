import asyncio
from pymongo import ASCENDING, DESCENDING, TEXT
from bson import ObjectId

# import your collection objects (make sure app.db.mongodb exports them)
from app.db.mongodb import (
    users_collection,
    books_collection,
    user_books_collection,
    libraries_collection,
    library_books_collection,
)
async def check():
    books = []
    cur = library_books_collection.find({"library_id": ObjectId("6952817c4ea3168e996f26b4")})

    async for i in cur:
        print(i)

asyncio.run(check())