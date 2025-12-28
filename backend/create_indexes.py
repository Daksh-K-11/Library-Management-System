import asyncio
from pymongo import ASCENDING, DESCENDING, TEXT

from app.db.mongodb import user_books_collection, books_collection, users_collection

## ---------------------------------------------------------------------------- ##
## EXECUTE THIS SCRIPT ONCE TO CREATE NECESSARY INDEXES IN THE COLLECTIONS      ##
## ---------------------------------------------------------------------------- ##

async def create_indexes():

    # users
    await users_collection.create_index(
        [("email", ASCENDING)],
        unique=True
    )

    # user_books
    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("updated_at", DESCENDING), ("_id", DESCENDING)]
    )

    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("genres", ASCENDING)]
    )

    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("read_status", ASCENDING)]
    )

    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("rating", DESCENDING)]
    )

    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("search_blob", TEXT)]
    )

    await user_books_collection.create_index(
        [("user_id", ASCENDING), ("book_id", ASCENDING)],
        unique=True
    )

    # books
    await books_collection.create_index(
        [("isbn_13", ASCENDING)],
        unique=True
    )

    await books_collection.create_index(
        [("isbn_10", ASCENDING)],
        sparse=True
    )

    print("✅ All indexes created successfully")



if __name__ == "__main__":
    asyncio.run(create_indexes())
